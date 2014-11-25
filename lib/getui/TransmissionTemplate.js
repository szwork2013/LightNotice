var fs = require('fs')
var p = require('node-protobuf').Protobuf
var pb = new p(fs.readFileSync(__dirname + '/GtReq.desc'))

function TransmissionTemplate(){
    this.appKey = "";
    this.appId = "";
    this.TransmissionType = 2;
    this.TransmissionContent = "";
    this.pushType = "TransmissionMsg";
    this.pushInfo = null;
    this.type = 1;
}


function getTransparent() {
    var transparent = {
        "id" : "",
        "action" : "pushmessage",
        "taskId" : "",
        "appKey" : this.appKey,
        "appId"  : this.appId,
        "messageId" : "",
        "pushInfo" : this.getPushInfo(),
        //"actionChains" : this.getActionChains()
    }
    var buffer = pb.Serialize(transparent, "protobuf.Transparent");
    var trans  = pb.Parse(buffer, "protobuf.Transparent");
    var array  = this.getActionChains();
    for (var i=0; i<array.length; i++) {
        trans.actionChain[i] = pb.Parse(pb.Serialize(array[i], "protobuf.ActionChain"), "protobuf.ActionChain");
    }
    return trans;
}


TransmissionTemplate.prototype.getTransparent = getTransparent;

function setPushInfo(actionLockey, badge, message, sound, payload, locKey, locArgs, launchImage) {
    this.pushInfo = {
        "actionLocKey" : actionLocKey,
        "badge" : badge,
        "message" : message,
        "sound" : sound,
        "payload" : payload,
        "locKey" : locKey,
        "locArgs" : locArgs,
        "launchImage" : launchImage
    }
}



function getPushInfo() {
    if (this.pushInfo == null) {
        this.pushInfo = {
            "message" : "",
            "actionKey" : "",
            "sound" : "",
            "badge" : "",
        };
    }
    //var buffer = pb.Serialize(pushInfo, "PushInfo");
    //var this.pushInfo = pb.Parse(buffer, "PushInfo");
    return this.pushInfo;
}

TransmissionTemplate.prototype.getPushInfo = getPushInfo;

function getActionChains() {
    var actionChain1 = {
        "actionId" : 1,
        "type" : 0,
        "next" : 10030
    }
    var appStartUp = {
        "android" : "",
        "symbia" : "",
        "ios" : ""
    }
    var autoFlag = false;
    if (this.type==1) {
        autoFlag = true;
    }
    var actionChain2 = {
        "actionId" : 10030,
        "type" :3,
        "appid" : "",
        "autostart" : autoFlag,    
        "appstartid" : appStartUp,
        "failedAction" : 100,
        "next" : 100
    }
    var actionChain3 = {
        "actionId" : 100,
        "type" : 7,
    }

    var actionChains = [actionChain1, actionChain2, actionChain3]
    return actionChains
}

TransmissionTemplate.prototype.getActionChains = getActionChains;

function getPushType() {

}

TransmissionTemplate.prototype.getPushType;

function getTransmissionContent() {

}

TransmissionTemplate.prototype.getTransmissionContent = getTransmissionContent;

exports.TransmissionTemplate = TransmissionTemplate;
