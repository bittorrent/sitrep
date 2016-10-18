function colorForHealth(health, saturation, brightness) {
    return 'rgb(' + HSLToRGB((health / 100) * (120 / 360), saturation, brightness).join(',') + ')';
}

function hueToRGB(p, q, t) {
    if (t < 0) { t += 1; }
    if (t > 1) { t -= 1; }
    if (t < 1/6) { return p + (q - p) * 6 * t; }
    if (t < 1/2) { return q; }
    if (t < 2/3) { return p + (q - p) * (2/3 - t) * 6; }
    return p;
}

function HSLToRGB(h, s, l) {
    var r, g, b;

    if (s === 0){
        r = g = b = l;
    } else {
        var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        var p = 2 * l - q;
        r = hueToRGB(p, q, h + 1/3);
        g = hueToRGB(p, q, h);
        b = hueToRGB(p, q, h - 1/3);
    }

    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

/**
* @param {number} secs Number of seconds
* @return {string} Integer number of the largest unit of time that
*     can be made from secs suffixed with the first letter of that unit
* Example:
*  @param {572}
*  @return {'9M'}
*/
function formatDuration(secs) {
    var sec_num = Math.floor(secs);
    var hours   = Math.floor(sec_num / 3600);
    var minutes = Math.floor((sec_num % 3600) / 60);
    var seconds = sec_num % 60;
    if (hours > 0) {
        hours += 'H';
        return hours;
    } else if (minutes > 0){
        minutes += 'M';
        return minutes;
    } else {
        seconds += 'S';
        return seconds;
    }
}

/**
* @param {object.
*     <string lifetime, number>,
*     <string time, date>
*   } update Object containg start-time and duration info about the update
* @return {object.
*     <string s, number> Number of seconds representing the start of update interval,
*     <string e, number> Number of seconds representing the end of update interval
*   } Object containing the start and end-time number of seconds of an update interval
*/
function getUpdateInterval(update) {
    return { s: new Date(update.time).getTime() / 1000, e: new Date(update.time).getTime() / 1000 + update.lifetime };
}

/** Must be called after google charts finishes loading.
* @param {array.
*     <string label> Label of an update,
*     <string status> Status of an update,
*     <date start> Start time of an update interbval,
*     <date end> End time of an update interval
*   } data Array containing the label, status, start and end-time number of seconds of an
*        update interval
* @return {array.
*     <string label>,
*     <string tooltip>,
*     <string status>,
*     <date start>,
*     <date end>
*   } Array containing the label, status, tooltip-html, start and end-time number of seconds of an
*        update interval
*/
var setTooltip = (function(){
    var dateFormat = new google.visualization.DateFormat({
          pattern: 'h:mm:ss.SSS aa'
    });

    return function(data) {
        var duration = (data[3].getTime() - data[2].getTime()) / 1000;
        var hours = Math.floor(( duration / 3600 ) % 24);
        var minutes = Math.floor(( duration / 60 ) % 60);
        var seconds = (duration % 60).toFixed(3);

        var tooltip = '<div class="ggl-tooltip"><span>' +
        data[1] + '</span></div><div class="ggl-tooltip"><span>' +
        data[0] + '</span>: ' +
        dateFormat.formatValue(data[2]) + ' - ' +
        dateFormat.formatValue(data[3]) + '</div>' +
        '<div class="ggl-tooltip"><span>Duration: </span>' +
        (hours > 0 ? hours + 'h ' : '') + (minutes > 0 ? minutes + 'm ' : '') + seconds + 's ' +
         '</div>';

        data.splice(2,0,tooltip);

        return data;
    };
});

function init() {
   $.get('/api/v1/components', function(data) {
       setTooltip = setTooltip();
       var components = [];
       $.each(data.components, function(id, component) {
           components.push(getComponentData(component));
       });
       components.sort(function(a, b) { return a.name.localeCompare(b.name); });
       $.each(components, function(id, component){
            populateComponent(component);
       });
   });
}

function getComponentData(component) {
    var updateHistory = component.update_history;
    var birth = new Date(updateHistory[updateHistory.length-1].time).getTime() / 1000;
    var now = Date.now() / 1000;
    var historyScale = 12 * 60 * 60;
    var timeBeingConsidered = now - Math.max(birth, now - historyScale);
    var timelineData = [];
    var timelineColors = [];
    var uptime = 0;
    var statusSeen = {};
    var first,second,data,start,end,status;

    for (var i = updateHistory.length-1; i >= 0; i--) {
        now = Date.now() / 1000;
        status = updateHistory[i].health + '% Health' + (updateHistory[i].status_description ? ': ' + updateHistory[i].status_description : '.');

        if (i === 0) {
            start = (updateHistory.length === 1 ? (new Date(updateHistory[i].time).getTime() / 1000) : second.s);
            start = Math.max(start, now - historyScale);
            start = Math.min(start, now);

            end = (updateHistory.length === 1 ? (new Date(updateHistory[i].time).getTime() / 1000) + updateHistory[i].lifetime : second.e );
            end = Math.min(end, now);

            if (end < now - historyScale) {
                break;
            }

            if (!statusSeen[status]) {
                timelineColors.push(colorForHealth(updateHistory[i].health, 0.5, 0.8));
                statusSeen[status] = true;
            }
            data = [updateHistory[i].label, status, new Date(start*1000), new Date(end*1000)];
            data = setTooltip(data);
            timelineData.push(data);
            uptime += (end - start) * (updateHistory[i].health / 100);
            break;
        }

        first = getUpdateInterval(updateHistory[i]);
        second = getUpdateInterval(updateHistory[i-1]);

        start = Math.max(first.s, now - historyScale);
        start = Math.min(now, start);
        end = Math.min(first.e, second.s, now);

        data = [updateHistory[i].label, status, new Date(start*1000), new Date(end*1000)];
        data = setTooltip(data);

        if (end < now - historyScale) {
            continue;
        }

        if (!statusSeen[status]) {
            timelineColors.push(colorForHealth(updateHistory[i].health, 0.5, 0.8));
            statusSeen[status] = true;
        }
        timelineData.push(data);
        uptime += (end - start) * (updateHistory[i].health / 100);
    }

    var padding = [component.label, 'padding', new Date(now*1000), new Date(now*1000+1)];
    padding = setTooltip(padding);
    timelineData.push(padding);
    timelineColors.push('rgb(255,255,255)');

    return {
        name: component.label,
        status: component.status,
        timelineData: timelineData,
        timelineColors: timelineColors,
        uptime: ((uptime / timeBeingConsidered) * 100).toFixed(6) + '%',
        tags: component.tags,
        timeBeingConsidered: timeBeingConsidered
    };
}

function populateComponent(data) {
    var $group = null;
    $('.component-group').each(function() {
        if (!$(this).data('tags')) { return; }
        var tags = $(this).data('tags');
        var match = true;
        for (var key in tags) {
            if (data.tags[key] !== tags[key]) {
                match = false;
            }
        }
        if (match) {
            $group = $(this);
        }
    });
    if (!$group) {
        $group = $('#other-components');
    }
    var $container = $group.children('.component-container');
    $group.show();

    var $component = $($('#component-template').html()).appendTo($container);
    var chart = new google.visualization.Timeline($component.find('.timeline').get(0));
    var dataTable = new google.visualization.DataTable();

    dataTable.addColumn({
        type: 'string',
        id: 'Role'
    });
    dataTable.addColumn({
        type: 'string',
        id: 'Name'
    });
    dataTable.addColumn({
        type: 'string',
        role: 'tooltip',
        p: {'html': true}
    });
    dataTable.addColumn({
        type: 'date',
        id: 'Start'
    });
    dataTable.addColumn({
        type: 'date',
        id: 'End'
    });


    dataTable.addRows(data.timelineData);

    var options = {
        timeline: {
            groupByRowLabel: true,
            showBarLabels: false,
            showRowLabels: false
        },
        avoidOverlappingGridLines: false,
        colors: data.timelineColors,
        tooltip: {
            isHtml: true
        }
    };

    $component.find('.name').text(data.name);
    $component.find('.up-time').text(formatDuration(data.timeBeingConsidered) + ': ' + data.uptime);
    $component.find('.status').text(data.status).addClass(data.status === 'stream error' ? 'error' : '');

    $component.on('resized', function() {
        chart.draw(dataTable, options);
    });

    $component.trigger('resized');
}

function checkHash() {
    if (window.location.hash === '#compact') {
        $('body').addClass('compact');
    } else {
        $('body').removeClass('compact');
    }
}

$(function() {
    checkHash();
    $(window).on('hashchange', function() {
        checkHash();
    });

    google.charts.load("current", {
        packages: ["timeline"]
    });
    google.charts.setOnLoadCallback(init);

    $(window).resize(function () {
        if ($('.component-container').data('width') !== $('.component-container').width() && !$('.component-container').data('resizing')) {
            $('.component-container').data('resizing', true);
            $('.component-container').data('width', $('.component-container').width());
            $('.component-container .component').trigger('resized');
            $('.component-container').data('resizing', false);
        }
    });
});
