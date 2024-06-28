'use strict';

var app = angular.module('application', []);

app.controller('AppCtrl', function($scope, appFactory){
   $("#success_init").hide();
   $("#success_charge").hide();
   $("#success_initItem").hide();
   $("#success_purchaseItem").show();
   $("#success_invoke").hide();
   $("#success_query").hide();
   $("#success_queryitem").hide();
   $("#success_admin").hide();
   $("#success_delete").hide();
   $scope.initAB = function(){
       appFactory.initAB($scope.userinfo, function(data){
           if(data == "")
           $scope.init_ab = "success";
           $("#success_init").show();
       });
   }
   $scope.chargeAB = function(){
        appFactory.chargeAB($scope.charge, function(data){
            if(data == "")
            $scope.charge_ab = "success";
            $("#success_charge").show();
        });
    }
   $scope.initItemAB = function(){
        appFactory.initItemAB($scope.Item, function(data){
            if(data == "")
            $scope.initItem_ab = "success";
            $("#success_initItem").show();
        });
    }
    $scope.purchaseItemAB = function(){
        appFactory.purchaseItemAB($scope.purchase, function(data){
            if(data == "")
            $scope.purchase_ab = "success";
            $("#success_purchaseItem").show();
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
   $scope.queryitemAB = function(){
        appFactory.queryitemAB($scope.itemId, function(data){
            $scope.queryitem_ab = data;
        });
    }
    $scope.querypurchaseAB = function(){
        appFactory.querypurchaseAB($scope.user, function(data){
            $scope.querypurchase_ab = data;
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
        $http.get('/init?user='+data.user+'&userval='+data.userval).success(function(output){
            callback(output)
        });
    }
    factory.chargeAB = function(data, callback){
        $http.get('/charge?user='+data.user+'&userval='+data.userval).success(function(output){
            callback(output)
        });
    }
    factory.initItemAB = function(data, callback){
        $http.get('/initItem?itemName='+data.itemName+'&styleNum='+data.styleNum+'&brand='+data.brand+'&inventory='+data.inventory).success(function(output){
            callback(output)
        });
    }
    factory.purchaseItemAB = function(data, callback){
        $http.get('/purchaseItem?user='+data.user+'&itemId='+data.itemId).success(function(output){
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
    factory.queryitemAB = function(itemId, callback){
        $http.get('/queryitem?itemId='+itemId).success(function(output){
            callback(output)
        });
    }
    factory.querypurchaseAB = function(user, callback){
        $http.get('/querypurchase?user='+user).success(function(output){
            callback(output)
        });
    }
    factory.deleteAB = (name, callback) => {
        $http.get('/delete?name='+name).success((output) => {
            callback(output)
        })
    } 


    return factory;
 });
 