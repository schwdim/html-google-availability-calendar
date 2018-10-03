var CALENDAR_ID = 'YOUR_PUBLIC_CALENDAR_ID';
var API_KEY = 'YOUR_GOOGLE_API_KEY';


var displayedDate = moment();
var bookedDates = [];

jQuery(document).ready(function startCalendar() {
    listUpcomingEvents();
});

function listUpcomingEvents() {
    document.getElementById("right").disabled = true;
    document.getElementById("left").disabled = true;

    jQuery.ajax({
        type: 'GET',
        url: encodeURI('https://www.googleapis.com/calendar/v3/calendars/' + CALENDAR_ID + '/events'),
        dataType: 'json',
        data: {
            key: API_KEY,
            timeMin: displayedDate.toDate().toISOString(),
            timeMax: moment(displayedDate).add(42, 'days').toDate().toISOString()
        },
        success: function(response) {
            var allDates = [];
            if (response.items.length > 0) {
                for (var i = 0; i < response.items.length; i++) {
                    var event = response.items[i];
                    if (typeof event.start === 'undefined') {
                        continue;
                    }
                    if (event.start.date != event.end.date) {
                        var currentDate = moment(event.start.date);
                        var lastDate = moment(event.end.date);

                        while(currentDate < lastDate){
                          allDates.push(currentDate.valueOf());
                          currentDate.add(1,'days');
                        }
                    } else {
                        if (event.start.date == -1) {
                            allDates.push(moment(event.start.date).valueOf());
                        }
                    }
                }
            }
            bookedDates = allDates;
            fillCalendar();
        },
        error: function(response) {
            console.log(response.responseText);
        }
    });
}

function nextMonth() {
    document.getElementById("right").disabled = true;
    document.getElementById("left").disabled = true;
    displayedDate.add(1, 'months');
    listUpcomingEvents();
}

function previousMonth() {
    document.getElementById("right").disabled = true;
    document.getElementById("left").disabled = true;
    displayedDate.subtract(1, 'months');
    listUpcomingEvents();
}

function fillCalendar() {
    var firstDayOfThisMonth = displayedDate;
    firstDayOfThisMonth.set('date', 1);

    var monthNames = ["January", "Ferbruary", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];


    monthName = document.getElementById("tabName").innerHTML = monthNames[firstDayOfThisMonth.get('month')] + ' ' + firstDayOfThisMonth.get('year');


    var daysAfterMonday = 0;
    if (firstDayOfThisMonth.day() != 1) {
        if (firstDayOfThisMonth.day() === 0) {
            daysAfterMonday = 6;
        } else {
            daysAfterMonday = firstDayOfThisMonth.day() - 1;
        }
    }

    firstMonday = moment(firstDayOfThisMonth).subtract(daysAfterMonday, 'days');
    var i = 0;
    jQuery("#calendar tbody td").each(function() {
        addDay(moment(firstMonday).add(i, 'days'), jQuery(this)[0]);
        i++;
    });

    var leftButton = document.getElementById('left');
    if (moment(displayedDate).subtract(1, 'months').startOf('day').isBefore(moment().set('date', 1).startOf('day'))) {
        leftButton.style.pointerEvents = 'none';
        leftButton.className = "disabled";
    } else {
        leftButton.style.pointerEvents = 'auto';
        leftButton.className = "";
    }

    document.getElementById("right").disabled = false;
    document.getElementById("left").disabled = false;
}

function addDay(day, td) {
    day.startOf('day');
    td.className = "";

    if (day.isSameOrAfter(moment().startOf('day'))) {
        if (day.month() != displayedDate.month()) {
            td.className += " past";
        }

        if (bookedDates.indexOf(day.toDate().getTime()) >= 0) {
            td.className += " booked";
        } else {
            td.className += " available";
        }
    } else {
        td.className += " past";
    }

    td.innerHTML = day.date();
}
