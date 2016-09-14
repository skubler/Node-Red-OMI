

module.exports = function(RED) {
    function omiNode(n) {
        RED.nodes.createNode(this,n);
        var node = this;
        this.on('input', function(msg) {
            //console.log("/Users/youradmin/.node-red/node_modules/omiNodecons/omiNodecons.js");
            //msg.payload = "events";
            //node.send(msg);
            var omiNodecons = require('node-red-contrib-omiNode/omiNodecons/omiNodecons.js');
            //console.log("toto");
            var omiN = new omiNodecons();
            
            console.log(n.path_InfoItem);
            console.log(n.token);
            console.log(n.operations);
            console.log(n.ttl);
            console.log(n.interval);
            console.log(n.callback);
            console.log(n.newest);
            console.log(n.oldest);
            console.log(n.begin);
            console.log(n.end);
            console.log(n.value);
            console.log(n.reqID);
            console.log(n.metadata);
            console.log(n.readTypes);
            console.log("---8888-----");
 
            if (n.ttl==""){
                n.ttl=1;
            }

            var options = {
                path_InfoItem: n.path_InfoItem,
                token: n.token,
               // operations: n.operations,
                ttl: n.ttl,
                interval: n.interval,
                callback: n.callback,
                newest: n.newest,
                oldest: n.oldest,
                begin: n.begin,
                end: n.end,
                value: n.value,
                reqID: n.reqID,
                metadata: n.metadata,
              //  read1time: n.read1time,
              //  subscribe: n.subscribe,
              //  poll: n.poll
          };

            //console.log(options.path_InfoItem);
            if (n.operations == "Read"){
                var oper_type="";
                if (n.readTypes=="read1time"){
                    omiN.ReadInfoItem(options, n.readTypes, function(err, events) {
                        console.log("I'm in ReadInfoItem for reading 1 time");
                        console.log(err);
                        msg.payload = events;
                        msg.err = err;
                        node.send(msg);
                    });
                }else if (n.readTypes=="subscribe"){
                    omiN.ReadInfoItem(options, n.readTypes, function(err, events) {
                        console.log("I'm in ReadInfoItem for subscription");
                        console.log(err);
                        msg.payload = events;
                        msg.err = err;
                        node.send(msg);
                    });
                }else if (n.readTypes=="poll"){
                    omiN.ReadInfoItem(options, n.readTypes, function(err, events) {
                        console.log("I'm in ReadInfoItem for polling");
                        console.log(err);
                        msg.payload = events;
                        msg.err = err;
                        node.send(msg);
                    });
                }else{

                }
            }
            else if (n.operations == "Write"){
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
            else if (n.operations == "Cancel"){
                console.log(n.operations);
                omiN.CancelSubscription(options, function(err, events) {
                    msg.payload = events;
                    msg.err = err;
                    console.log("I'm in Cancel1");
                    console.log(err);
                    console.log(msg.payload);
                    console.log("I'm in Cancel2");
                    node.send(msg);
                });
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



