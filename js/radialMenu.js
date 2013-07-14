radialMenu = angular.module("radialMenu", []);
    angular.forEach(['d','dx', 'dy', 'width', 'height', 'cx', 'cy'], function(name) {
        var ngName = 'ng' + name[0].toUpperCase() + name.slice(1);
        radialMenu.directive(ngName, function() {
            return function(scope, element, attrs) {
                attrs.$observe(ngName, function(value) {
                    attrs.$set(name, value);
                })
            };
        });
    });

radialMenu.
    directive("radialMenu", function () {
        return {
            restrict:"E",
            scope: true,
            link: function (scope,elm,attrs){
                scope.classRoot = attrs.radialClass || "radialmenu";

                scope.visible = false;
                elm.bind('mouseleave', function(){
                    scope.$apply(scope.visible = false);
                });
                scope.h = function () {scope.visible = false};

                scope.radius = attrs.radius || 100;
                scope.svgCenterX = scope.radius;
                scope.svgCenterY = scope.radius;
                scope.startAngle = 90;


                scope.getD = function (startAngle, endAngle) {
                    var x1 = scope.svgCenterX + scope.radius * Math.cos(Math.PI * startAngle / 180);
                    var y1 = scope.svgCenterY + scope.radius * Math.sin(Math.PI * startAngle / 180);
                    var x2 = scope.svgCenterX + scope.radius * Math.cos(Math.PI * endAngle / 180);
                    var y2 = scope.svgCenterY + scope.radius * Math.sin(Math.PI * endAngle / 180);

                    var pathString = "M" + scope.svgCenterX + " " + scope.svgCenterY + " L" + x1 + " " + y1 + " A" + scope.radius + " " + scope.radius + " 0 0 1 " + x2 + " " + y2 + " z";
                    return pathString;
                }

                              //could parameterize this function name
                scope.$parent.createRadialMenu = function (list, event){

                    //Create menu
                        scope.middleButton = list[0];

                        //All items but first
                        var length = list.length - 1;

                        scope.wedges = [];
                        scope.wedgeSize = 360 / length;


                        for (var i = 1; i <= length; i++){
                            var wedgeStartAngle = scope.startAngle + i * scope.wedgeSize;
                            var wedgeEndAngle   = scope.startAngle + i * scope.wedgeSize + scope.wedgeSize;

                            var wedge = {};

                            wedge.d = scope.getD(wedgeStartAngle, wedgeEndAngle);
                            wedge.data = list[i];

                            var textAngle = (wedgeEndAngle + wedgeStartAngle) / 2;

                            wedge.t = {
                                x: scope.svgCenterX + (scope.svgCenterX * .65) * Math.cos(Math.PI * textAngle/180),
                                y: scope.svgCenterY + (scope.svgCenterX * .65) * Math.sin(Math.PI * textAngle/180)
                            }

                            scope.wedges.push(wedge);
                        }

                    //Show at mouse
                        scope.visible = true;
                        scope.position = {
                            position: "absolute",
                            left: (event.pageX - scope.radius) + "px",
                            top: (event.pageY - scope.radius) + "px"
                        }
                }
            },
            replace: true,
            template: '<svg id="{{ classRoot }}" ng-show="visible" ng-style="position" ng-width="{{ radius * 2 }}" ng-height="{{ radius * 2 }}">' +
                '<g ng-repeat="wedge in wedges">' +
                '   <path ng-click="wedge.data.f(); h()" class="{{ classRoot }}-button" ng-d="{{wedge.d}}"/>' +
                '   <text class="{{ classRoot }}-text" ng-dx="{{ wedge.t.x }}" ng-dy="{{ wedge.t.y }}">{{ wedge.data.text }}</text>' +
                '</g>' +
                '<g>' +
                '   <circle ng-click="middleButton.f(); h()" class="{{ classRoot }}-button" r=40 ng-cx="{{ svgCenterX }}" ng-cy="{{ svgCenterY }}"/>' +
                '   <text class="{{ classRoot }}-text" ng-dx="{{ svgCenterX }}" ng-dy="{{ svgCenterY }}">{{ middleButton.text }}</text>' +
                '</g>' +
            '</svg>'
        }
    })



