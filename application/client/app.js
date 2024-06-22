'use strict';

var app = angular.module('application', []);

app.controller('AppCtrl', function($scope, appFactory){
   $("#success_init").hide();
   $("#success_invoke").hide();
   $("#success_qurer").hide();
   $("#success_admin").hide();
   $("#success_delete").hide();
   $scope.initAB = function(){
       appFactory.initAB($scope.abstore, function(data){
           if(data == "")
           $scope.init_ab = "success";
           $("#success_init").show();
       });
   }
   $scope.invokeAB = function(){
        appFactory.invokeAB($scope.transfer, function(data){
            if(data == "")
            $scope.invoke_ab = "success";
            $("#success_invoke").show();
        });
    }
   $scope.queryAB = function(){
       appFactory.queryAB($scope.walletid, function(data){
           $scope.query_ab = data;
           $("#success_query").show();
       });
   }
   $scope.adminAB = function(){
    appFactory.queryAB("admin", function(data){
        $scope.admin_ab = data;
        $("#success_admin").show();
    });
}
   $scope.deleteAB = () => {
    appFactory.deleteAb($scope.deleteId, (data) => {
        if(data == "")
        $scope.delete_ab = "success";
        $("#success_delete").show();
    });
   }
});
app.factory('appFactory', function($http){
      
    var factory = {};
 
    factory.initAB = function(data, callback){
        $http.get('/init?a='+data.a+'&aval='+data.aval).success(function(output){
            callback(output)
        });
    }
    factory.invokeAB = function(data, callback){
        $http.get('/invoke?sender='+data.sender+'&reciever='+data.reciever+'&value='+data.value).success(function(output){
            callback(output)
        });
    }
    factory.queryAB = function(name, callback){
        $http.get('/query?name='+name).success(function(output){
            callback(output)
        });
    }
    factory.deleteAb = (name, callback) => {
        $http.get('/delete?name='+name).success((output) => {
            callback(output)
        })
    } 


    return factory;
 });
 