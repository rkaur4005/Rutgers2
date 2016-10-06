/**
 * Created by Developer 3 on 6/16/2016.
 */
/*global angular, $, MathJax, console*/
(function(angular) {
    'use strict';
    angular
        .module('egyanApp.assessment', [])
        .controller('AssessmentCrtCtrl', ['$scope', '$window', '$routeParams', '$http', '$uibModal', '$filter', 'globalConfig', 'Auth', 'assessmentfields', 'NavItems', function($scope, $window, $routeParams, $http, $uibModal, $filter, globalConfig, Auth, assessmentfields, NavItems) {
            $scope.assessmentshown = "create";
            NavItems.navitems.nav = {};
            assessmentfields.setclassid($routeParams.classId);
            // setting Position of Segments
            $scope.setPosSeg = function(oldIndex, positionChange) {
                if (oldIndex > positionChange) {

                    positionChange = positionChange - (oldIndex + 1);
                }
                if (oldIndex > -1) {
                    var newIndex = (oldIndex + positionChange);
                    if (newIndex < 0) {
                        newIndex = 0;
                    } else if (newIndex >= $scope.formdata.segments.length) {
                        newIndex = $scope.formdata.segments.length;
                    }
                    var arrayClone = $scope.formdata.segments.slice();
                    arrayClone.splice(oldIndex, 1);
                    arrayClone.splice(newIndex, 0, $scope.formdata.segments[oldIndex]);
                    $scope.formdata.segments = arrayClone;
                }
            };
            // setting Position of Question
            $scope.setPosQuestion = function(oldIndex, positionChange, outerindex) {
                if (oldIndex > positionChange) {
                    positionChange = positionChange - (oldIndex + 1);
                }
                if (oldIndex > -1) {
                    var newIndex = (oldIndex + positionChange);
                    if (newIndex < 0) {
                        newIndex = 0;
                    } else if (newIndex >= $scope.formdata.segments[outerindex].questions.length) {
                        newIndex = $scope.formdata.segments[outerindex].questions.length;
                    }
                    var arrayClone = $scope.formdata.segments[outerindex].questions.slice();
                    arrayClone.splice(oldIndex, 1);
                    arrayClone.splice(newIndex, 0, $scope.formdata.segments[outerindex].questions[oldIndex]);
                    $scope.formdata.segments[outerindex].questions = arrayClone;
                }
            };
            // toggle two tabs create Assessment Add Segment
            $scope.toggleasstab = function($event, tab) {
                $event.preventDefault();
                $scope.assessmentshown = tab;
            };
            // adding new segment
            $scope.addSegment = function($event) {
                $event.preventDefault();
                $scope.formdata.segments.push({
                    questions: [],
                    assessmentsegment_id: null,
                    segment_Name: "Segment Number " + ($scope.formdata.segments.length + 1),
                    assessment_id: null,
                    segment_position: ($scope.formdata.segments.length + 1),
                    question_score: 1.0,
                    selection_count: "",
                    question_order: ""
                });
            };
            // removing added segement
            $scope.removeSegment = function($event, $index) {
                $event.preventDefault();
                $scope.formdata.segments.splice($index, 1);
            };
            // need window hight for popup
            $scope.modelheight = $window.innerHeight - 455;
            //Slider with draggable range
            $scope.slider_draggable_range = {
                minValue: 1,
                maxValue: 8,
                options: {
                    ceil: 8,
                    floor: 1,
                    draggableRange: true
                }
            };
            // main submit button
            $scope.submitAssessmentObj = function() {
                angular.forEach($scope.formdata.segments, function(value, key) {
                    if (!value.questions.length) {
                        NavItems.errmsg = "Please add Question in " + value.segment_Name;
                        return;
                    } else {
                        //changing date for question
                        angular.forEach(value.questions, function(questval, quekey) {
                            if (questval.excluded_from) {
                                questval.excluded_from = $filter('date')(questval.excluded_from, 'yyyy-MM-dd') + ' ';
                                if (questval.excluded_from_datetime) {
                                    questval.excluded_from += $filter('date')(questval.excluded_from_datetime, 'HH:mm:ss');
                                } else {
                                    questval.excluded_from += '01:00:00';
                                }
                            } else {
                                questval.excluded_from = null;
                            }

                            if (questval.included_from) {
                                questval.included_from = $filter('date')(questval.included_from, 'yyyy-MM-dd') + ' ';
                                if (questval.included_from_datetime) {
                                    questval.included_from += $filter('date')(questval.included_from_datetime, 'HH:mm:ss');
                                } else {
                                    questval.included_from += '23:59:59';
                                }
                            } else {
                                questval.included_from = null;
                            }
                        });
                        // changing date for assessment level
                        $scope.formdata.open_date = $filter('date')($scope.formdata.open_date, 'yyyy-MM-dd') + " " + $filter('date')($scope.formdata.open_datetime, 'HH:mm:ss');
                        $scope.formdata.close_date = $filter('date')($scope.formdata.close_date, 'yyyy-MM-dd') + " " + $filter('date')($scope.formdata.close_datetime, 'HH:mm:ss');
                        //cahngin date in classsection
                        if ($scope.formdata.classsections.length) {
                            angular.forEach($scope.formdata.classsections, function(classsec, classkey) {
                                if (classsec.open_date_override) {
                                    classsec.open_date_override = $filter('date')(classsec.open_date_override, 'yyyy-MM-dd') + ' ';
                                    if (!classsec.open_date_override_datetime) {
                                        classsec.open_date_override += '01:00:00';
                                    } else {
                                        classsec.open_date_override += $filter('date')(classsec.open_date_override_datetime, 'HH:mm:ss');
                                    }
                                } else {
                                    classsec.open_date_override = null;
                                }

                                if (classsec.close_date_override) {
                                    classsec.close_date_override = $filter('date')(classsec.close_date_override, 'yyyy-MM-dd') + ' ';
                                    if (!classsec.close_date_override_datetime) {
                                        classsec.close_date_override += '23:59:59';
                                    } else {
                                        classsec.close_date_override += $filter('date')(classsec.close_date_override_datetime, 'HH:mm:ss');
                                    }
                                } else {
                                    classsec.close_date_override = null;
                                }
                            });
                        }
                    }
                });
                $http.post(globalConfig.service.elearning + globalConfig.service.assessment.finalpostassessment, $.param({
                    json: JSON.stringify($scope.formdata)
                }))
                    .then(function(data, status, headers, config) {
                        if (data.data) {
                            NavItems.errmsg = data.data.msg;
                        } else {
                            NavItems.errmsg = 'Error getting learning objectives';
                        }
                    }, function(data, status, headers, config) {
                        NavItems.errmsg = 'Error deriving learning objectives';
                    });
            };
            // open Question Pickers
            $scope.modalButtonClick = function(index) {
                var modalInstance = $uibModal.open({
                    animation: $scope.animationsEnabled,
                    templateUrl: 'app/assessment/questionlistView.html',
                    controller: 'ModalInstanceCtrl',
                    size: 'lg',
                    backdrop: 'static',
                    resolve: {
                        segIndexID: function() {
                            return index;
                        }
                    }
                });
                modalInstance.result.then(function(selectedItem) {
                    angular.forEach(selectedItem, function(value, key) {
                        var ifvalueexist = $scope.formdata.segments[index].questions.indexOf(value);
                        if (ifvalueexist < 0) {
                            $scope.formdata.segments[index].questions.push(value);
                        }
                    });
                }, function() {

                });
            };
            // getting all configuration data initially
            var params = {
                class_id: $routeParams.classId,
                callback: 'JSON_CALLBACK'
            };
            assessmentfields.getConfigureData()
                .then(function(data, status, headers, config) {
                    if (data.data) {
                        $scope.configureoptions = data.data;
                    } else {
                        NavItems.errmsg = 'Error getting learning objectives';
                    }
                }, function(data, status, headers, config) {
                    NavItems.errmsg = 'Error deriving learning objectives';
                });
            // mocking data that need to send in Backend
            $scope.formdata = {
                classsections: [{
                    assessment_id: null,
                    classsection_id: null,
                    open_date_override: new Date(),
                    close_date_override: new Date()
                }],
                segments: [{
                    questions: [],
                    segment_Name: "Segment Number 1",
                    assessmentsegment_id: null,
                    assessment_id: null,
                    segment_position: 1,
                    question_score: null,
                    selection_count: null,
                    question_order: null
                }],
                assessment_id: null,
                assessment_name: null,
                class_id: $routeParams.classId,
                assessment_type: null,
                offer_mode: null,
                retake_policy: null,
                validation_mode: null,
                open_date: new Date(),
                close_date: new Date(),
                open_datetime: null,
                close_datetime: null,
                duration_minutes: null,
                segment_name: null,
                self_efficacy: false
            };
        }])
        .controller('ModalInstanceCtrl', ['$scope', '$window', '$filter', '$uibModalInstance', 'assessmentfields', '$http', 'globalConfig', 'NavItems', 'segIndexID', function($scope, $window, $filter, $uibModalInstance, assessmentfields, $http, globalConfig, NavItems, segIndexID) {
            $scope.selectedQuestionArr = [];
            // getting configure setting data
            assessmentfields.getConfigureData()
                .then(function(data, status, headers, config) {
                    if (data.data) {
                        $scope.configureoptions = data.data;
                    } else {
                        NavItems.errmsg = 'Error getting learning objectives';
                    }
                }, function(data, status, headers, config) {
                    NavItems.errmsg = 'Error deriving learning objectives';
                });
            // filter config
            $scope.filterconfig = {};
            $scope.modelheight = $window.innerHeight - 204;
            // gett all questions
            $scope.getallquestions = function() {
                if ($scope.filterconfig.chaptersection_id) {
                    var params = {
                        chaptersection_id: $scope.filterconfig.chaptersection_id,
                        callback: 'JSON_CALLBACK'
                    };
                    $http.jsonp(globalConfig.service.elearning + globalConfig.service.assessment.populatequestions + '?' + $.param(params))
                        .then(function(data, status, headers, config) {
                            if (data.data) {
                                $scope.allQuestionArr = data.data.rows;
                            } else {
                                NavItems.errmsg = 'Error getting learning objectives';
                            }
                        }, function(data, status, headers, config) {
                            NavItems.errmsg = 'Error deriving learning objectives';
                        });
                } else {
                    $scope.allQuestionArr = [];
                }
            };
            // include question inside array
            $scope.classificationselec = [];
            $scope.complexityselec = [];
            $scope.includeClassification = function(classy) {
                var i = $.inArray(classy, $scope.classificationselec);
                if (i > -1) {
                    $scope.classificationselec.splice(i, 1);
                } else {
                    $scope.classificationselec.push(classy);
                }
            };
            $scope.addSelectedQuestions = function(complex) {
                if ($scope.selectedQuestionArr.length) {
                    $uibModalInstance.close($scope.selectedQuestionArr);
                }
            };
            $scope.classficFilter = function(classific) {
                if ($scope.classificationselec.length > 0) {
                    if ($.inArray(classific.classification, $scope.classificationselec) < 0)
                        return;
                }
                return classific;
            };
            $scope.complexityFilter = function(complex) {
                if (complex.complexity < $scope.slidermindefault && complex.complexity > $scope.slidermaxdefault) {
                    return;
                }
                return complex;
            };
            $scope.slidermindefault = 1;
            $scope.slidermaxdefault = 8;
            //Range slider with ticks and values
            $scope.range_slider_ticks_values = {
                options: {
                    ceil: 8,
                    floor: 1,
                    showTicksValues: true
                }
            };
            $scope.addQueSelArr = function($event, quest) {
                $event.preventDefault();
                quest.selected = !quest.selected;
                var ifvalueexist = $scope.selectedQuestionArr.indexOf(quest);
                if (ifvalueexist < 0) {
                    $scope.selectedQuestionArr.push(quest);
                } else {
                    $scope.selectedQuestionArr.splice(ifvalueexist, 1);
                }
            };

            $scope.cancelQuestionModel = function() {
                $uibModalInstance.dismiss('cancel');
            };
        }])
        .controller('AssessmentMCrtCtrl', ['$scope', '$window', '$routeParams', '$http', '$uibModal', '$filter', 'globalConfig', 'Auth', 'assessmentfields', 'NavItems', function($scope, $window, $routeParams, $http, $uibModal, $filter, globalConfig, Auth, assessmentfields, NavItems) {
            $scope.assessmentshown = "create";
            NavItems.navitems.nav = {};
            assessmentfields.setclassid($routeParams.classId);
            // toggle two tabs create Assessment Add Segment
            $scope.toggleasstab = function($event, tab) {
                $event.preventDefault();
                $scope.assessmentshown = tab;
            };
            // need window hight for popup
            $scope.modelheight = $window.innerHeight - 455;
            //Slider with draggable range
            $scope.slider_draggable_range = {
                minValue: 1,
                maxValue: 8,
                options: {
                    ceil: 8,
                    floor: 1,
                    draggableRange: true
                }
            };
            //main submit button
            $scope.submitAssessmentObj = function() {
                //TODO: add implementation....
                angular.forEach($scope.formdata.segments, function(value, key) {
                    if (!value.questions.length) {
                        NavItems.errmsg = "Please add Question in " + value.segment_Name;
                        return;
                    } else {
                        //changing date for question
                        angular.forEach(value.questions, function(questval, quekey) {
                            if (questval.excluded_from) {
                                questval.excluded_from = $filter('date')(questval.excluded_from, 'yyyy-MM-dd') + ' ';
                                if (questval.excluded_from_datetime) {
                                    questval.excluded_from += $filter('date')(questval.excluded_from_datetime, 'HH:mm:ss');
                                } else {
                                    questval.excluded_from += '01:00:00';
                                }
                            } else {
                                questval.excluded_from = null;
                            }

                            if (questval.included_from) {
                                questval.included_from = $filter('date')(questval.included_from, 'yyyy-MM-dd') + ' ';
                                if (questval.included_from_datetime) {
                                    questval.included_from += $filter('date')(questval.included_from_datetime, 'HH:mm:ss');
                                } else {
                                    questval.included_from += '23:59:59';
                                }
                            } else {
                                questval.included_from = null;
                            }
                        });
                        // changing date for assessment level
                        $scope.formdata.open_date = $filter('date')($scope.formdata.open_date, 'yyyy-MM-dd') + " " + $filter('date')($scope.formdata.open_datetime, 'HH:mm:ss');
                        $scope.formdata.close_date = $filter('date')($scope.formdata.close_date, 'yyyy-MM-dd') + " " + $filter('date')($scope.formdata.close_datetime, 'HH:mm:ss');
                        //cahngin date in classsection
                        if ($scope.formdata.classsections.length) {
                            angular.forEach($scope.formdata.classsections, function(classsec, classkey) {
                                if (classsec.open_date_override) {
                                    classsec.open_date_override = $filter('date')(classsec.open_date_override, 'yyyy-MM-dd') + ' ';
                                    if (!classsec.open_date_override_datetime) {
                                        classsec.open_date_override += '01:00:00';
                                    } else {
                                        classsec.open_date_override += $filter('date')(classsec.open_date_override_datetime, 'HH:mm:ss');
                                    }
                                } else {
                                    classsec.open_date_override = null;
                                }

                                if (classsec.close_date_override) {
                                    classsec.close_date_override = $filter('date')(classsec.close_date_override, 'yyyy-MM-dd') + ' ';
                                    if (!classsec.close_date_override_datetime) {
                                        classsec.close_date_override += '23:59:59';
                                    } else {
                                        classsec.close_date_override += $filter('date')(classsec.close_date_override_datetime, 'HH:mm:ss');
                                    }
                                } else {
                                    classsec.close_date_override = null;
                                }
                            });
                        }
                    }
                });
                $http.post(globalConfig.service.elearning + globalConfig.service.assessment.finalpostmassessment, $.param({
                    json: JSON.stringify($scope.formdata)
                }))
                    .then(function(data, status, headers, config) {
                        if (data.data) {
                            NavItems.errmsg = data.data.msg;
                        } else {
                            NavItems.errmsg = 'Error getting learning objectives';
                        }
                    }, function(data, status, headers, config) {
                        NavItems.errmsg = 'Error deriving learning objectives';
                    });
            };
            // adding new segment
            $scope.addSegment = function($event) {
                $event.preventDefault();
                $scope.formdata.segments.push({
                    questions: [],
                    assessmentsegment_id: null,
                    segment_Name: "Segment Number " + ($scope.formdata.segments.length + 1),
                    assessment_id: null,
                    segment_position: ($scope.formdata.segments.length + 1),
                    question_score: 1.0,
                    selection_count: "",
                    question_order: ""
                });
            };
            // removing added segement
            $scope.removeSegment = function($event, $index) {
                $event.preventDefault();
                $scope.formdata.segments.splice($index, 1);
            };
            // open Question Pickers
            $scope.modalButtonClick = function(index) {
                var modalInstance = $uibModal.open({
                    animation: $scope.animationsEnabled,
                    templateUrl: 'app/assessment/questionlistView.html',
                    controller: 'ModalInstanceCtrl',
                    size: 'lg',
                    backdrop: 'static',
                    resolve: {
                        segIndexID: function() {
                            return index;
                        }
                    }
                });
                modalInstance.result.then(function(selectedItem) {
                    angular.forEach(selectedItem, function(value, key) {
                        var ifvalueexist = $scope.formdata.segments[index].questions.indexOf(value);
                        if (ifvalueexist < 0) {
                            $scope.formdata.segments[index].questions.push(value);
                        }
                    });
                }, function() {});
            };
            // getting all configuration data initially
            var params = {
                class_id: $routeParams.classId,
                callback: 'JSON_CALLBACK'
            };
            assessmentfields.getConfigureData()
                .then(function(data, status, headers, config) {
                    if (data.data) {
                        $scope.configureoptions = data.data;
                    } else {
                        NavItems.errmsg = 'Error getting learning objectives';
                    }
                }, function(data, status, headers, config) {
                    NavItems.errmsg = 'Error deriving learning objectives';
                });
            // mocking data that need to send in Backend
            $scope.formdata = {
                classsections: [{
                    assessment_id: null,
                    classsection_id: null,
                    open_date_override: new Date(),
                    close_date_override: new Date()
                }],
                mastery: {
                    masteryassessment_id: null,
                    assessment_type: null,
                    percentage_1: 50.0,
                    percentage_2: 25.0,
                    percentage_3: 25.0,
                    percentage_4: 0.0,
                    percentage_5: 0.0
                },
                segments: [{
                    questions: [],
                    segment_Name: "Segment Number ",
                    assessmentsegment_id: null,
                    assessment_id: null,
                    segment_position: 1,
                    question_score: null,
                    selection_count: null,
                    question_order: null
                }],
                assessment_id: null,
                assessment_name: null,
                class_id: $routeParams.classId,
                assessment_type: null,
                offer_mode: null,
                retake_policy: null,
                validation_mode: null,
                open_date: new Date(),
                close_date: new Date(),
                open_datetime: null,
                close_datetime: null,
                duration_minutes: null,
                self_efficacy: false
            };
        }])
        .controller('AssessmentPreviewCtrl', ['$scope', '$routeParams', '$http', '$sce', '$timeout', 'globalConfig', 'NavItems', function($scope, $routeParams, $http, $sce, $timeout, globalConfig, NavItems) {
            $scope.assessmentid = $routeParams.assessmentId;
            var params = {
                assessment_id: $scope.assessmentid,
                callback: 'JSON_CALLBACK'
            };
            $http.jsonp(globalConfig.service.elearning + globalConfig.service.assessment.preview + '?' + $.param(params))
                .then(function(data) {
                    if (data.data) {
                        angular.forEach(data.data.assessment.questions, function(qanda) {
                            qanda.question_text = $sce.trustAsHtml(qanda.question_text);
                            angular.forEach(qanda.answers, function(ans) {
                                ans.formatted = $sce.trustAsHtml(ans.formatted);
                            });
                        });
                        $scope.assessment = data.data.assessment;
                        angular.forEach($scope.assessment.questions, function(qanda, i) {
                            $timeout(function() {
                                MathJax.Hub.Queue(["Typeset", MathJax.Hub, 'question' + i]);
                            }, 1000);
                            angular.forEach(qanda.answers, function(ans, j) {
                                if (ans.mathjax) {
                                    $timeout(function() {
                                        MathJax.Hub.Queue(["Typeset", MathJax.Hub, 'ans' + i + '_' + j]);
                                    }, 1000);
                                }
                            });
                        });
                    } else {
                        NavItems.errmsg = 'Error getting assessment data';
                    }
                }, function() {
                    NavItems.errmsg = 'Error getting assessment data';
                });
            $http.jsonp(globalConfig.service.elearning + globalConfig.service.assessment.preview + '?' + $.param(params))
                .then(function(data) {
                    if (data.data) {
                        $scope.scores = data.data.results;
                    }
                }, function() {
                    NavItems.errmsg = 'Error getting assessment scores';
                });
        }])
        .controller('AssessmentMPreviewCtrl', ['$scope', '$routeParams', '$http', '$sce', '$timeout', 'globalConfig', 'NavItems', function($scope, $routeParams, $http, $sce, $timeout, globalConfig, NavItems) {
            $scope.masteryassessmentid = $routeParams.masteryassessmentId;
            var params = {
                masteryassessment_id: $scope.masteryassessmentid,
                callback: 'JSON_CALLBACK'
            };
            $http.jsonp(globalConfig.service.elearning + globalConfig.service.assessment.mpreview + '?' + $.param(params))
                .then(function(data) {
                    if (data.data) {
                        angular.forEach(data.data.masteryassessment.questions, function(qanda) {
                            qanda.question_text = $sce.trustAsHtml(qanda.question_text);
                            angular.forEach(qanda.answers, function(ans) {
                                ans.formatted = $sce.trustAsHtml(ans.formatted);
                            });
                        });
                        $scope.masteryassessment = data.data.masteryassessment;
                        angular.forEach($scope.masteryassessment.questions, function(qanda, i) {
                            $timeout(function() {
                                MathJax.Hub.Queue(["Typeset", MathJax.Hub, 'question' + i]);
                            }, 1000);
                            angular.forEach(qanda.answers, function(ans, j) {
                                if (ans.mathjax) {
                                    $timeout(function() {
                                        MathJax.Hub.Queue(["Typeset", MathJax.Hub, 'ans' + i + '_' + j]);
                                    }, 1000);
                                }
                            });
                        });
                    } else {
                        NavItems.errmsg = 'Error getting assessment data';
                    }
                }, function() {
                    NavItems.errmsg = 'Error getting assessment data';
                });
            $http.jsonp(globalConfig.service.elearning + globalConfig.service.assessment.mpreview + '?' + $.param(params))
                .then(function(data) {
                    if (data.data) {
                        $scope.scores = data.data.results;
                    }
                }, function() {
                    NavItems.errmsg = 'Error getting quiz scores';
                });
        }])
        .controller('AssessmentTakeCtrl', ['$scope', '$routeParams', '$http', '$sce', '$timeout', 'globalConfig', 'Auth', 'NavItems', function($scope, $routeParams, $http, $sce, $timeout, globalConfig, Auth, NavItems) {
            $scope.assessment_id = $routeParams.assessmentId;
            $scope.assessmentstatus = 'LOADING';
            $scope.assessmentsubmit = function () {
                var anss = [];
                var params = {};
                angular.forEach($scope.assessment.questions, function (qanda) {
                    anss.push(qanda.selectedans);
                });
                params.uuid = $scope.uuid;
                params.assessment_id = $scope.assessment_id;
                params.json = JSON.stringify({answers: anss});
                $http.post(globalConfig.service.elearning + globalConfig.service.assessment.submitanswer, $.param(params))
                    .then(function (data) {
                        if (data.data && data.data.success) {
                            $scope.assessmentmsg = '<strong>Your assessment is submitted</strong>. You may review your answers now';
                            angular.forEach(data.data.results, function (result, i) {
                                angular.forEach($scope.assessment.questions[i].answers, function (ans) {
                                    if (result.is) {
                                        if ($scope.assessment.questions[i].selectedans === ans.value) {
                                            ans.correct = 'has-success';
                                        }
                                    } else {
                                        if (ans.value === result.correct) {
                                            ans.correct = 'has-success';
                                        }
                                        if (ans.value === $scope.assessment.questions[i].selectedans) {
                                            ans.correct = 'has-error';
                                        }
                                    }
                                });
                            });
                            $scope.assessmentstatus = 'SUBMITTED';
                        } else if (!data.data.issuccess && data.data.msg) {
                            NavItems.errmsg = data.data.msg;
                        } else {
                            NavItems.errmsg = 'Error submitting assessment';
                        }
                    }, function () {
                        NavItems.errmsg = 'Error submitting assessment';
                    });
            };
            var params = {assessment_id: $scope.assessment_id, callback: 'JSON_CALLBACK'};
            $http.jsonp(globalConfig.service.elearning + globalConfig.service.assessment.take + '?' + $.param(params))
                .then(function (data) {
                    if (data.data && data.data.assessment) {
                        $scope.uuid = data.data.assessment.assessment_uuid;
                        $scope.time_remaining = Math.round(data.data.time_remaining);
                        console.log(new Date($scope.time_remaining).toDateString());
                        angular.forEach(data.data.assessment.questions, function (qanda) {
                            qanda.question_text = $sce.trustAsHtml(qanda.question_text);
                            if (qanda.answers) {
                                angular.forEach(qanda.answers, function (ans) {
                                    ans.formatted = $sce.trustAsHtml(ans.formatted);
                                });
                            }
                        });
                        $scope.assessment = data.data.assessment;
                        $scope.assessmentstatus = 'IN-PROGRESS';
                        angular.forEach($scope.assessment.questions, function (qanda, i) {
                            $timeout(function () {
                                MathJax.Hub.Queue(['Typeset', MathJax.Hub, 'question' + i]);
                            }, 1000);
                            angular.forEach(qanda.answers, function (ans, j) {
                                if (ans.mathjax) {
                                    $timeout(function () {
                                        MathJax.Hub.Queue(['Typeset', MathJax.Hub, 'ans' + i + '_' + j]);
                                    }, 1000);
                                }
                            });
                        });
                        $scope.$broadcast('timer-start');
                    } else {
                        NavItems.errmsg = 'Error fetching assessment';
                    }
                }, function() {
                    NavItems.errmsg = 'Error fetching assessment';
                });
        }])
        .controller('AssessmentReviewCtrl', ['$scope', '$routeParams', '$http', '$sce', '$timeout', 'globalConfig', 'Auth', 'NavItems', function($scope, $routeParams, $http, $sce, $timeout, globalConfig, Auth, NavItems) {
           /* $scope.user_type = Auth.getUserType();*/
            $scope.user_id = $routeParams.user_id;
            $scope.uuid = $routeParams.uuid;
            var params = {
                uuid: $scope.uuid,
                callback: 'JSON_CALLBACK'
            };
            $http.jsonp(globalConfig.service.elearning + globalConfig.service.assessment.review + '?' + $.param(params))
                .then(function (data) {
                    if (data.data) {
                        angular.forEach(data.data.assessment.questions, function (qanda) {
                            qanda.question_text = $sce.trustAsHtml(qanda.question_text);
                            angular.forEach(qanda.answers, function (ans) {
                                ans.formatted = $sce.trustAsHtml(ans.formatted);
                            });
                        });
                        if (data.data.late_seconds) {
                            data.data.late_seconds = Math.floor(((data.data.late_seconds % 86400) % 3600) / 60);
                        }
                        $scope.assessment = data.data.assessment;
                        angular.forEach($scope.assessment.questions, function (qanda, i) {
                            $timeout(function () {
                                MathJax.Hub.Queue(["Typeset", MathJax.Hub, 'question' + i]);
                            }, 1000);

                            angular.forEach(qanda.answers, function (ans, j) {
                                if (ans.mathjax) {
                                    $timeout(function () {
                                        MathJax.Hub.Queue(["Typeset", MathJax.Hub, 'ans' + i + '_' + j]);
                                    }, 1000);
                                }

                                if (qanda.recordedAnswerIsCorrect) {
                                    if (qanda.recordedAnswer === ans.value) {
                                        ans.correct = 'has-success';
                                    }
                                } else {
                                    if (ans.value === qanda.correctAnswer) {
                                        ans.correct = 'has-success';
                                    }
                                    if (ans.value === qanda.recordedAnswer) {
                                        ans.correct = 'has-error';
                                    }
                                }
                            });
                        });

                    } else {
                        NavItems.errmsg = 'Error getting Assessment Review';
                    }
                }, function() {
                    NavItems.errmsg = 'Error getting Assessment Review';
                });
                }])

        .controller('AssessmentListCtrl', ['$scope', '$routeParams', '$http', '$sce', '$timeout', 'globalConfig', 'Auth', 'NavItems', function($scope, $routeParams, $http, $sce, $timeout, globalConfig, Auth, NavItems) {
            $scope.user_type = Auth.getUserType();
            $scope.classid = $routeParams.classId;
            var params = {
                class_id: $scope.classid,
                callback: 'JSON_CALLBACK'
            };
            $http.jsonp(globalConfig.service.elearning + globalConfig.service.assessment.listassessment + '?' + $.param(params))
                .then(function(data) {
                    if (data.data.assessments) {
                        $scope.assessments = data.data.assessments;
                    } else {
                        NavItems.errmsg = 'Error getting assessments';
                    }
                }, function() {
                    NavItems.errmsg = 'Error getting assessments';
                });
        }]);
}(angular, MathJax));