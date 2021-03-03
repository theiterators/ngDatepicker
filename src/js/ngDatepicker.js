angular.module('jkuri.datepicker', [])
.directive('ngDatepicker', ['$document', function($document) {
    'use strict';
    var setScopeValues = function (scope, attrs) {
        scope.format = attrs.format || 'YYYY-MM-DD';
        scope.viewFormat = attrs.viewFormat || 'Do MMMM YYYY';
        scope.locale = attrs.locale || 'en';
        scope.tabIndex = attrs.tabIndex || '1';
        scope.firstWeekDaySunday = scope.$eval(attrs.firstWeekDaySunday) || false;
        scope.placeholder = attrs.placeholder || '';
        scope.onBlurDisable = false;
    };
    return {
        restrict: 'EA',
        require: '?ngModel',
        scope: {},
        link: function (scope, element, attrs, ngModel) {
            setScopeValues(scope, attrs);
            scope.calendarOpened = false;
            scope.days = [];
            scope.dayNames = [];
            scope.viewValue = null;
            scope.dateValue = null;
            scope.mouseIsOnCalendar = false;
            scope.id = Math.floor((Math.random()*68789)+1);
            scope.error = false;
            moment.locale(scope.locale);
            var date = moment();
            var generateCalendar = function (date) {
                var lastDayOfMonth = date.endOf('month').date(),
                    month = date.month(),
                    year = date.year(),
                    n = 1;
                var firstWeekDay = scope.firstWeekDaySunday === true ? date.set('date', 2).day() : date.set('date', 1).day();
                if (firstWeekDay !== 1) {
                    n -= firstWeekDay - 1;
                }
                if(n==2)
                    n = -5;
                scope.dateValue = date.format('MMMM YYYY');
                scope.days = [];
                for (var i = n; i <= lastDayOfMonth; i += 1) {
                    if (i > 0) {
                        scope.days.push({day: i, month: month + 1, year: year, enabled: true});
                    } else {
                        scope.days.push({day: null, month: null, year: null, enabled: false});
                    }
                }
            };
            var generateDayNames = function () {
                var date = scope.firstWeekDaySunday === true ?  moment('2015-06-07') : moment('2015-06-01');
                for (var i = 0; i < 7; i += 1) {
                    scope.dayNames.push(date.format('ddd'));
                    date.add('1', 'd');
                }
            };
            generateDayNames();
            scope.keypressed = function(ev) {
                if (ev.keyCode == 13) { //Enter
                    var d = !scope.viewValue ? null : moment(scope.viewValue, scope.viewFormat);
                    ngModel.$setViewValue(d.format(scope.format));
                    scope.viewValue = d.format(scope.viewFormat);
                    if(d != null) {
                        ngModel.$setViewValue(d.format(scope.format));
                        scope.viewValue = d.format(scope.viewFormat);
                        if("Invalid date" === d.format(scope.viewFormat)) {
                            scope.error = true;
                        }
                        else {scope.error = false;}
                    }
                    document.getElementById(scope.id).blur();
                    scope.closeCalendar();
                }
                else if (ev.keyCode == 27) { //ESC
                    var d = moment(ngModel.$modelValue);
                    scope.viewValue = d.format(scope.viewFormat);
                    scope.closeCalendar();
                    scope.error = false;
                }
            }
            scope.onBlur = function() { // on Blur (mouse leave)
                if(scope.viewValue != null && !scope.mouseIsOnCalendar) {
                    var d = moment(scope.viewValue, scope.viewFormat);
                    ngModel.$setViewValue(d.format(scope.format));
                    scope.viewValue = d.format(scope.viewFormat);
                    if("Invalid date" === d.format(scope.viewFormat)) {
                          scope.error = true;
                    }
                    else {scope.error = false;}
                    scope.closeCalendar();
                }
            };
            scope.showCalendar = function () {
                scope.calendarOpened = true;
                generateCalendar(date);
            };

            scope.onCalendar = function (onCalendar) {
                scope.mouseIsOnCalendar = onCalendar;
            };

            scope.closeCalendar = function () {
                scope.calendarOpened = false;
            };
            scope.prevYear = function () {
                date.subtract(1, 'Y');
                generateCalendar(date);
            };
            scope.prevMonth = function () {
                date.subtract(1, 'M');
                generateCalendar(date);
            };
            scope.nextMonth = function () {
                date.add(1, 'M');
                generateCalendar(date);
            };
            scope.nextYear = function () {
                date.add(1, 'Y');
                generateCalendar(date);
            };
            scope.selectDate = function (event, date) {
                event.preventDefault();
                var selectedDate = moment(date.day + '.' + date.month + '.' + date.year, 'DD.MM.YYYY');
                event.preventDefault();
                ngModel.$setViewValue(selectedDate.format(scope.format));
                scope.viewValue = selectedDate.format(scope.viewFormat);
                scope.error = false;
                scope.closeCalendar();
            };
            // if clicked outside of calendar
            var classList = ['ng-datepicker', 'ng-datepicker-input'];
            if (attrs.id !== undefined) classList.push(attrs.id);
            $document.on('click', function (e) {
                if (!scope.calendarOpened) return;
                var i = 0,
                    element;
                if (!e.target) return;
                for (element = e.target; element; element = element.parentNode) {
                    var id = element.id;
                    var classNames = element.className;
                    if (id !== undefined) {
                        for (i = 0; i < classList.length; i += 1) {
                            if (id.indexOf(classList[i]) > -1 || classNames.indexOf(classList[i]) > -1) {
                                return;
                            }
                        }
                    }
                }
                var d = !scope.viewValue ? null : moment(scope.viewValue, scope.viewFormat)
                ngModel.$setViewValue(d && d.format(scope.format));
                scope.viewValue = d && d.format(scope.viewFormat);
                scope.closeCalendar();
                scope.$apply();
            });
            ngModel.$render = function () {
                var newValue = ngModel.$viewValue;
                if (newValue !== undefined) {
                    scope.viewValue = moment(newValue).format(attrs.viewFormat);
                    scope.dateValue = newValue;
                }
            };
        },
        template:
        '<div><input id="{{id}}" tabindex="{{tabIndex}}" type="text" ng-focus="showCalendar()" ng-keydown="keypressed($event)" ng-model="viewValue" ng-class="{isInvalidDate: error}" ng-blur="onBlur()" class="ng-datepicker-input" placeholder="{{ placeholder }}"></div>' +
        '<div class="ng-datepicker" ng-show="calendarOpened" ng-mouseover="onCalendar(true)" ng-mouseleave="onCalendar(false)">' +
        '  <div class="controls">' +
        '    <div class="left">' +
        '      <i class="fa fa-backward prev-year-btn" ng-click="prevYear()"></i>' +
        '      <i class="fa fa-angle-left prev-month-btn" ng-click="prevMonth()"></i>' +
        '    </div>' +
        '    <span class="date" ng-bind="dateValue"></span>' +
        '    <div class="right">' +
        '      <i class="fa fa-angle-right next-month-btn" ng-click="nextMonth()"></i>' +
        '      <i class="fa fa-forward next-year-btn" ng-click="nextYear()"></i>' +
        '    </div>' +
        '  </div>' +
        '  <div class="day-names">' +
        '    <span ng-repeat="dn in dayNames">' +
        '      <span>{{ dn }}</span>' +
        '    </span>' +
        '  </div>' +
        '  <div class="calendar">' +
        '    <span ng-repeat="d in days">' +
        '      <span class="day" ng-click="selectDate($event, d)" ng-class="{disabled: !d.enabled}">{{ d.day }}</span>' +
        '    </span>' +
        '  </div>' +
        '</div>'
    };
}]);
