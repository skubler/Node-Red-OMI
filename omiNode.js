

module.exports = function(RED) {
    function omiNode(n) {
        RED.nodes.createNode(this,n);
        var node = this;
        this.on('input', function(msg) {
            //console.log("/Users/youradmin/.node-red/node_modules/omiNodecons/omiNodecons.js");
            //msg.payload = "events";
            //node.send(msg);
            var path_InfoItem, token, operations, ttl, interval, callback, newest, oldest, begin, end, value, reqID, metadata, readTypes;

            var omiNodecons = require('node-red-contrib-omiNode/omiNodecons/omiNodecons.js');
            //console.log("toto");
            var omiN = new omiNodecons();
            
            console.log(n.path_InfoItem+"msg.path_InfoItem="+msg.path_InfoItem);
            console.log(n.token+"msg.token="+msg.token);
            console.log(n.operations+"msg.operations="+msg.operations);
            console.log(n.ttl+"msg.ttl="+msg.ttl);
            console.log(n.interval+"msg.interval="+msg.interval);
            console.log(n.callback+"msg.callback="+msg.callback);
            console.log(n.newest+"msg.newest="+msg.newest);
            console.log(n.oldest+"msg.oldest="+msg.oldest);
            console.log(n.begin+"msg.begin="+msg.begin);
            console.log(n.end+"msg.end="+msg.end);
            console.log(n.value+"msg.value="+msg.value);
            console.log(n.reqID+"msg.reqID="+msg.reqID);
            console.log(n.metadata+"msg.metadata="+msg.metadata);
            console.log(n.readTypes+"msg.readTypes="+msg.readTypes);
            console.log("---8888-----");

            if (n.ttl=="" && typeof msg.ttl=="undefined"){
                n.ttl=1;
            }

            if(typeof msg.path_InfoItem!="undefined"){
                path_InfoItem= n.path_InfoItem || msg.path_InfoItem;
            }
            else{
                path_InfoItem= n.path_InfoItem;
            }

            if(typeof msg.token!="undefined"){
                token= n.token || msg.token;
            }
            else{
                token= n.token;
            }

            if(typeof msg.operations!="undefined"){
                operations= n.operations || msg.operations;
            }
            else{
                operations= n.operations;
            }

            if(typeof msg.ttl!="undefined"){
                ttl= n.ttl || msg.ttl;
            }
            else{
                ttl= n.ttl;
            }

            if(typeof msg.interval != "undefined"){
                interval= n.interval || msg.interval;
            }
            else{
                interval= n.interval;
            }

            if(typeof msg.callback!="undefined"){
                callback= n.callback || msg.callback;
            }
            else{
                callback= n.callback;
            }

            if(typeof msg.newest!="undefined"){
                newest= n.newest || msg.newest;
            }
            else{
                newest= n.newest;
            }

            if(typeof msg.oldest!="undefined"){
                oldest= n.oldest || msg.oldest;
            }
            else{
                oldest= n.oldest;
            }

            if(typeof msg.begin!="undefined"){
                begin= n.begin || msg.begin;
            }
            else{
                begin= n.begin;
            }

            if(typeof msg.end!="undefined"){
                end= n.end || msg.end;
            }
            else{
                end= n.end;
            }

            if(typeof msg.value!="undefined"){
                value= n.value || msg.value;
            }
            else{
                value= n.value;
            }

            if(typeof msg.reqID!="undefined"){
                reqID= n.reqID || msg.reqID;
            }
            else{
                reqID= n.reqID;
            }

            if(typeof msg.metadata!="undefined"){
                metadata= n.metadata || msg.metadata;
            }
            else{
                metadata= n.metadata;
            }

            if(typeof msg.readTypes!="undefined"){
                readTypes= n.readTypes || msg.readTypes;
            }
            else{
                readTypes= n.readTypes;
            }
            
            console.log("---=====//////////////-----");
            console.log(path_InfoItem);
            console.log(token);
            console.log(operations);
            console.log(ttl);
            console.log(interval);
            console.log(callback);
            console.log(newest);
            console.log(oldest);
            console.log(begin);
            console.log(end);
            console.log(value);
            console.log(reqID);
            console.log(metadata);
            console.log(readTypes);
            console.log("---=====//////////////-----");              

            var options = {
                path_InfoItem: path_InfoItem,
                token: token,
                operations: operations,
                ttl: ttl,
                interval: interval,
                callback: callback,
                newest: newest,
                oldest: oldest,
                begin: begin,
                end: end,
                value: value,
                reqID: reqID,
                metadata: metadata,
                readTypes: readTypes
              //  read1time: n.read1time,
              //  subscribe: n.subscribe,
              //  poll: n.poll
          };
          console.log("---°°°00099888Y768GHJFG");
          console.log(operations);
          if (operations == "Read"){
            var oper_type="";
            if (readTypes=="read1time"){
                omiN.ReadInfoItem(options, readTypes, function(err, events) {
                    console.log("I'm in ReadInfoItem for reading 1 time");
                    console.log(err);
                    msg.payload = events;
                    msg.err = err;
                    node.send(msg);
                });
            }else if (readTypes=="subscribe"){
                omiN.ReadInfoItem(options, readTypes, function(err, events) {
                    console.log("I'm in ReadInfoItem for subscription");
                    console.log(err);
                    msg.payload = events;
                    msg.err = err;
                    node.send(msg);
                });
            }else if (readTypes=="poll"){
                omiN.ReadInfoItem(options, readTypes, function(err, events) {
                    console.log("I'm in ReadInfoItem for polling");
                    console.log(err);
                    msg.payload = events;
                    msg.err = err;
                    node.send(msg);
                });
            }else{
                console.log("mmmhhh...");
            }
        }
        else if (operations == "Write"){
                //console.log(n.operations);
                omiN.WriteInfoItem(options, function(err, events) {
                    console.log("I'm in Write1");
                    console.log(err);
                    console.log("I'm in Write1");
                    msg.payload = events;
                    msg.err = err;
                    node.send(msg);
                });
            }
            else if (operations == "Cancel"){
                console.log(operations);
                omiN.CancelSubscription(options, function(err, events) {
                    msg.payload = events;
                    msg.err = err;
                    console.log("I'm in Cancel1");
                    console.log(err);
                    console.log(msg.payload);
                    console.log("I'm in Cancel2");
                    node.send(msg);
                });
            }else if (operations == "built4WS"){
                console.log(operations);
                msg.payload=omiN.BuiltReqWs(options,"read1time");
                console.log("I'm in built4WS");
                console.log(msg.payload);
                console.log("I'm in built4WS");
                node.send(msg);
            }else{
                console.log("There is a problem because no operation has been selected");
                node.send("There is a problem because no operation has been selected");
            }
        });
}
RED.nodes.registerType("omiNode",omiNode);

            /*else if (n.operations == "Subscription"){
                console.log(n.operations);
                omiN.SubscribeInfoItem(options, function(err, events) {
                    console.log(err);
                    msg.payload = events;
                    node.send(msg);
                });
            }*/

/*
function OmiConfigNode(n) {
        RED.nodes.createNode(this,n);
        //console.log(node.path_InfoItem);
        //this.client_id = n.client_id;
        //this.client_secret = n.client_secret;
        //this.username = n.username;
        //this.password = n.password;
        //this.device_id = n.device_id;
    }
    RED.nodes.registerType("configNodeOMI",OmiConfigNode);
    */
};



