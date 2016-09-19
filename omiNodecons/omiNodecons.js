var util = require('util');
var EventEmitter = require("events").EventEmitter;
var request = require('request');
var moment = require('moment');
var http = require('http');

const BASE_URL = 'https://api.omiNodecons.net';

var username;
var password;
var client_id;
var client_secret;
var scope;
var access_token;

/**
 * @constructor
 * @param args
 */
 var omiNodecons = function (args) {
  EventEmitter.call(this);
  //this.authenticate(args);
  //this.path_InfoItem="tt";
};

util.inherits(omiNodecons, EventEmitter);

/**
 * handleRequestError
 * @param err
 * @param response
 * @param body
 * @param message
 * @param critical
 * @returns {Error}
 */
 omiNodecons.prototype.handleRequestError = function (err, response, body, message, critical) {
  var errorMessage = "";
  if (body && response.headers['content-type'] === 'application/json') {
    errorMessage = JSON.parse(body);
    errorMessage = errorMessage && (errorMessage.error.message || errorMessage.error);
  } else if (typeof response !== 'undefined') {
    errorMessage = "Status code" + response.statusCode;
  }
  else {
    errorMessage = "No response";
  }
  var error = new Error(message + ": " + errorMessage);
  if (critical) {
    this.emit("error", error);
  } else {
    this.emit("warning", error);
  }
  return error;
};

/***************************************************************************
****************************************************************************
*****************        CREATE O-MI/O-DF Messages        ******************
****************************************************************************
****************************************************************************/

/*Creation of the O-MI/O-DF message when performing a Read (read1time) request whose input parameters are contained in:
@options: all necessary paramters (e.g., TTL, newest, oldest...) entered via Node-Red UI
*/
omiNodecons.prototype.ReadInfoItem = function (options, oper_type, callback) {
  var xmlmsg_omiodf, xmlmsg_odf;
  var DOMParser = require('xmldom').DOMParser;

  if (oper_type=="read1time" || oper_type=="subscribe"){
   if (oper_type=="read1time" && options.metadata){
    xmlmsg_odf = createODF_ReadwithMetadata(options.path_InfoItem);
  }else{
    //console.log("createODF_Read(options.path_InfoItem)");
    xmlmsg_odf = createODF_Read(options.path_InfoItem,"InfoItem");
  }
  xmlmsg_omiodf = createOMIODF_Read(options,oper_type,xmlmsg_odf.payload);
} else if(oper_type=="poll"){
 xmlmsg_odf = createODF_poll(options.reqID);
 xmlmsg_omiodf = createOMIODF_Read_poll(options,xmlmsg_odf.payload);
}else{
  xmlmsg_odf.payload="The requested operation is neither 'read1time' nor 'subscription' nor 'poll'";
}
console.log("1*********");
console.log(xmlmsg_omiodf);
console.log("2*********");

var url_ominode = options.path_InfoItem.split("/Objects")[0];
console.log(url_ominode);
//var xmlmsg='<?xml version="1.0"?><omi:omiEnvelope xmlns:xs="http://www.w3.org/2001/XMLSchema-instance" xmlns:omi="omi.xsd" version="1.0" ttl="0"><omi:read msgformat="odf"><omi:msg><Objects xmlns="odf.xsd"><Object><id>Haut_Fourneaux_Site_1</id><Object><id>Kuka_Robots</id><Object><id>KR_6_R700_sixx_WP</id><Object><id>Sensors</id><InfoItem name="Motor_speed"/></Object></Object></Object></Object></Objects></omi:msg></omi:read></omi:omiEnvelope>';
//http://localhost:8383/IoTLab2/Servlet

//---------------Send the 1st request---------------------------------//

request({
  //url: 'http://127.0.0.1:8080',
  url: url_ominode,
  method: "POST",
  headers: {
        "content-type": "text/xml",  // <--Very important!!!
      },
      body: xmlmsg_omiodf
    //form: form,
  }, function (err, response, body_resp) {
console.log("tttttttttttttt");
    /*console.log(body_resp);
    console.log("ssssssssssss");*/
    parser = new DOMParser();
    xmlDoc = parser.parseFromString(body_resp,"text/xml");
    var err_odf=xmlDoc.getElementsByTagName("omi:result")[0].childNodes[0].getAttribute("returnCode");
    //console.log(err_odf);
    //.getAttribute("returnCode");
     //console.log(err_odf);
    //var path_check = body_resp.split('Such item/s not found.');
    
    if (err_odf == 400 || err_odf == 404){
      //console.log("8888888888888888888888");
      //xmlmsg_omiodf = '<?xml version="1.0"?><omi:omiEnvelope xmlns:xs="http://www.w3.org/2001/XMLSchema-instance" xmlns:omi="omi.xsd" version="1.0" ttl="0"><omi:read msgformat="odf"><omi:msg><Objects xmlns="odf.xsd"><Object><id>Haut_Fourneaux_Site_1</id><Object><id>Kuka_Robots</id><Object><id>KR_6_R700_sixx_WP</id><Object><id>Sensors</id><InfoItem name="Motor_speed"/></Object></Object></Object></Object></Objects></omi:msg></omi:read></omi:omiEnvelope>';
      //console.log(path_check.length);
      
      //------------------Send 2nd request if code error indicating that the InfoItem doesn't exist----------------------//
      
      xmlmsg_odf = createODF_Read(options.path_InfoItem,"Object");
      xmlmsg_omiodf = createOMIODF_Read(options,oper_type,xmlmsg_odf.payload);

      /*console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
      console.log(xmlmsg_odf);
      console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");*/

      request({
        url: url_ominode,
        method: "POST",
        headers: {
        "content-type": "text/xml",  // <--Very important!!!
      },
      body: xmlmsg_omiodf
    //form: form,
  }, function (err, response, body_resp) {

    //console.log(body_resp);
    var path_check = body_resp.split('Such item/s not found.');
    
    if (path_check.length>1){
      //console.log("-----------------------------------------------------");
    } else{
      console.log("It works now!! (needed to create a 2nd request without InfoItem (object as the lowest hierarchy level))");
    }
    //body = JSON.parse(body);

    //console.log(body.body);
    this.emit(err, body_resp);

    if (callback) {
      //console.log(body_resp);
      return callback(err, body_resp);
    }

    return body_resp;

  }.bind(this));
    }
    
    //--------Catch error of the 1st request if code !=200 (since anyway the error code of the 2nd request will be displayed in the UI)--//

    if (err || err_odf != 200) {
      //console.log("))))))))))))");
      //console.log(body_resp);
      return this.handleRequestError(err, response, body_resp, "getUser error");
    }
    //console.log(body.body);
    this.emit(err, body_resp);

    if (callback) {
      //console.log(body_resp);
      return callback(err, body_resp);
    }


    return body_resp;

  }.bind(this));

return this;
};

/*Creation of the O-MI/O-DF message when performing a Write request whose input parameters are contained in:
@options: all necessary paramters (i.e., Value to be written, TTL...) entered via Node-Red UI
*/ 
omiNodecons.prototype.WriteInfoItem = function (options, callback) {

 var xmlmsg_odf = createODF_write(options.path_InfoItem,options.value);
 console.log(xmlmsg_odf.payload);
 var xmlmsg_omiodf = createOMIODF_Write(options,xmlmsg_odf.payload);
 console.log("6*********");
 console.log(xmlmsg_omiodf);
 console.log("7*********");
 
 var url_ominode = options.path_InfoItem.split("/Objects")[0];

   //console.log(xmlmsg_odf.err);
   //var xmlmsg='<?xml version="1.0"?><omi:omiEnvelope xmlns:xs="http://www.w3.org/2001/XMLSchema-instance" xmlns:omi="omi.xsd" version="1.0" ttl="0"><write xmlns="omi.xsd" msgformat="odf"><msg><Objects xmlns="odf.xsd"><Object><id>Haut_Fourneaux_Site_1</id><Object><id>Kuka_Robots</id><Object><id>KR_6_R700_sixx_WP</id><Object><id>Sensors</id><InfoItem name="Motor_speed"><value unixTime="1473405793" type="xs:string">20000</value></InfoItem></Object></Object></Object></Object></Objects></msg></write></omi:omiEnvelope>';

   request({
    url: url_ominode,
    method: "POST",
    headers: {
        "content-type": "text/xml",  // <--Very important!!!
      },
      body: xmlmsg_omiodf
    //form: form,
  }, function (err, response, body_resp) {

    /*if (err || response.statusCode != 200) {
      return this.handleRequestError(err, response, body_resp, "getUser error");
    }*/

    this.emit(err, body_resp);

    if (callback) {
      console.log(body_resp);
      return callback(err, body_resp);
    }


    return body_resp;

  }.bind(this));

   return this;
 };

/*Creation of the O-MI/O-DF message when performing a Cancel request whose input parameters are contained in:
 * @options: all necessary paramters (i.e., reqID, TTL...) entered via Node-Red UI
 */ 
 omiNodecons.prototype.CancelSubscription = function (options, callback) {
  var xmlmsg_odf = createODF_cancel(options.reqID);
  console.log(xmlmsg_odf.payload);
  var xmlmsg_omiodf = createOMIODF_Cancel(options,xmlmsg_odf.payload);
  console.log("4*********");
  console.log(xmlmsg_omiodf);
  console.log("5*********");
   //console.log(xmlmsg_odf.err);

   var url_ominode = options.path_InfoItem.split("/Objects")[0];
   //var xmlmsg='<?xml version="1.0"?><omi:omiEnvelope xmlns:xs="http://www.w3.org/2001/XMLSchema-instance" xmlns:omi="omi.xsd" version="1.0" ttl="10"><cancel xmlns="omi.xsd"><requestID>2</requestID></cancel></omi:omiEnvelope>';

   request({
    url: url_ominode,
    method: "POST",
    headers: {
        "content-type": "text/xml",  // <--Very important!!!
      },
      body: xmlmsg_omiodf
    //form: form,
  }, function (err, response, body_resp) {

    /*if (err || response.statusCode != 200) {
      console.log("§§§§§§§§§§§§§§§§§§§§§§§§§§§§§§§");
      console.log(body_resp);
      return callback(err, body_resp);
      //return this.handleRequestError(err, response, body_resp, "getUser error");
    }*/

    //console.log(body);
    //body = JSON.parse(body);

    //console.log(body.body);
    this.emit(err, body_resp);

    if (callback) {
      return callback(err, body_resp);
    }


    return body_resp;

  }.bind(this));

   return this;
 };


/*Creation of the O-MI/O-DF message when performing a Read (read1time) request whose input parameters are contained in:
@options: all necessary paramters (e.g., TTL, newest, oldest...) entered via Node-Red UI
*/
omiNodecons.prototype.BuiltReqWs = function (options, oper_type) {
  var xmlmsg_omiodf, xmlmsg_odf;
  var DOMParser = require('xmldom').DOMParser;

  if (oper_type=="read1time" || oper_type=="subscribe"){
   if (oper_type=="read1time" && options.metadata){
    xmlmsg_odf = createODF_ReadwithMetadata(options.path_InfoItem);
  }else{
    //console.log("createODF_Read(options.path_InfoItem)");
    xmlmsg_odf = createODF_Read(options.path_InfoItem,"InfoItem");
  }
  xmlmsg_omiodf = createOMIODF_Read(options,oper_type,xmlmsg_odf.payload);
} else if(oper_type=="poll"){
 xmlmsg_odf = createODF_poll(options.reqID);
 xmlmsg_omiodf = createOMIODF_Read_poll(options,xmlmsg_odf.payload);
}else{
  xmlmsg_omiodf="The requested operation is neither 'read1time' nor 'subscription' nor 'poll'";
}
console.log("1*********");
console.log(xmlmsg_omiodf);
console.log("2*********");

    return xmlmsg_omiodf;
};


/***************************************************************************
*****************        CREATE O-MI HEADER/FOOTER       ********************
****************************************************************************/
function createOMIODF_Read(options,oper_type,ODFpayload) {
  var OpenTag_OMIheader_withoutTTL= '<?xml version="1.0"?><omi:omiEnvelope xmlns:xs="http://www.w3.org/2001/XMLSchema-instance" xmlns:omi="omi.xsd" version="1.0" ttl="';
  var OpenTag_OMIheader_part2= '><omi:read msgformat="odf"';
  var CloseTag_OMIheader_part2= '><omi:msg><Objects xmlns="odf.xsd">';
  var CloseTag_OMIfooter='</Objects></omi:msg></omi:read></omi:omiEnvelope>';
  
  var OpenTag_OMIheader=OpenTag_OMIheader_withoutTTL.concat(options.ttl,'"');

  if (oper_type=="read1time"){
    if (options.newest!=""){
      OpenTag_OMIheader_part2 = OpenTag_OMIheader_part2.concat(' newest="',options.newest,'"');
    }
    if (options.oldest!=""){
      OpenTag_OMIheader_part2 = OpenTag_OMIheader_part2.concat(' oldest="',options.oldest,'"');
    }
    if (options.begin!=""){
      OpenTag_OMIheader_part2 = OpenTag_OMIheader_part2.concat(' begin="',options.begin,'"');
    }
    if (options.end!=""){
      OpenTag_OMIheader_part2 = OpenTag_OMIheader_part2.concat(' end="',options.end,'"');
    }
  } else if (oper_type=="subscribe"){
    if (options.interval!=""){
      OpenTag_OMIheader_part2 = OpenTag_OMIheader_part2.concat(' interval="',options.interval,'"');
      if (options.callback!=""){
        OpenTag_OMIheader_part2 = OpenTag_OMIheader_part2.concat(' callback="',options.callback,'"');
      }
    } else{
      console.log("Interval paramater is MANDATORY");
    }
  } else{
    console.log("The requested operation is neither 'read1time' or 'subscription'");
  }

  var OMIODF_msg = OpenTag_OMIheader.concat(OpenTag_OMIheader_part2,CloseTag_OMIheader_part2,ODFpayload,CloseTag_OMIfooter);

  return OMIODF_msg;
};

function createOMIODF_Read_poll(options,ODFpayload) {
  var OpenTag_OMIheader_withoutTTL= '<?xml version="1.0"?><omi:omiEnvelope xmlns:xs="http://www.w3.org/2001/XMLSchema-instance" xmlns:omi="omi.xsd" version="1.0" ttl="';
  var OpenTag_OMIheader_part2= '><omi:read>';
  var CloseTag_OMIfooter='</omi:read></omi:omiEnvelope>';
  
  var OpenTag_OMIheader=OpenTag_OMIheader_withoutTTL.concat(options.ttl,'"');
  var OMIODF_msg = OpenTag_OMIheader.concat(OpenTag_OMIheader_part2,ODFpayload,CloseTag_OMIfooter);

  return OMIODF_msg;
};

function createOMIODF_Write(options,ODFpayload) {
  var OpenTag_OMIheader_withoutTTL= '<?xml version="1.0"?><omi:omiEnvelope xmlns:xs="http://www.w3.org/2001/XMLSchema-instance" xmlns:omi="omi.xsd" version="1.0" ttl="';
  var CloseTag_OMIheader_part2= '><omi:write msgformat="odf"><omi:msg><Objects xmlns="odf.xsd">';
  var CloseTag_OMIfooter='</Objects></omi:msg></omi:write></omi:omiEnvelope>';
  var OMIODF_msg=OpenTag_OMIheader_withoutTTL.concat(options.ttl,'"',CloseTag_OMIheader_part2,ODFpayload,CloseTag_OMIfooter);

  return OMIODF_msg;
};

function createOMIODF_Cancel(options,ODFpayload) {
  var OpenTag_OMIheader_withoutTTL= '<?xml version="1.0"?><omi:omiEnvelope xmlns:xs="http://www.w3.org/2001/XMLSchema-instance" xmlns:omi="omi.xsd" version="1.0" ttl="';
  var CloseTag_OMIheader_part2= '><omi:cancel xmlns="omi.xsd">';
  var CloseTag_OMIfooter='</omi:cancel></omi:omiEnvelope>';
  var OMIODF_msg=OpenTag_OMIheader_withoutTTL.concat(options.ttl,'"',CloseTag_OMIheader_part2,ODFpayload,CloseTag_OMIfooter);

  return OMIODF_msg;
};

/***************************************************************************
****************************************************************************
*****************          CREATE O-DF PAYLOAD           *******************
****************************************************************************
****************************************************************************/

/*Creation of the O-DF payload of a Read request based on the following input parameters:
@path (entered in Node-Red UI): corresponding to the O-DF hierarchy, up to the InfoItem name to be written
*/
function createODF_Read(path, str) {
  var odf_pay = {payload: "", err: ""};
  var i_Objs;
console.log("§§§§§§§§§§§§§§§§§§§§§§§§§§§§§§§")
console.log(path);
console.log(str);
console.log("§§§§§§§§§§§§§§§§§§§§§§§§§§§§§§§")
  var res_split = path.split("/");

  for (i = 0; i <= res_split.length; i++) { 
    if (res_split[i]=="Objects")
      i_Objs=i;
  }

  if (i_Objs==undefined){
    odf_pay.err = "The InfoItem Path is not correct because it doesn't contain 'Objects'";
  } else{
    for (i = (res_split.length-1); i > i_Objs; i--) {
      if(i == (res_split.length-1) && str=="InfoItem"){
        odf_pay.payload = createODF_InfoItemRead(res_split[i],"without");
        console.log("str=='InfoItem'");
      }else{
        odf_pay.payload = createODF_Object(odf_pay.payload,res_split[i]);
        console.log("str=='Object'");
      }
    }
  }
  console.log(odf_pay);
  return odf_pay;
};

/*Creation of the O-DF payload of a Read request based on the following input parameters:
@path (entered in Node-Red UI): corresponding to the O-DF hierarchy, up to the InfoItem name to be written
*/
function createODF_ReadwithMetadata(path) {
  var odf_pay = {payload: "", err: ""};
  var i_Objs;

  var res_split = path.split("/");

  for (i = 0; i <= res_split.length; i++) { 
    if (res_split[i]=="Objects")
      i_Objs=i;
  }

  if (i_Objs==undefined){
    odf_pay.err = "The InfoItem Path is not correct because it doesn't contain 'Objects'";
  } else{
    for (i = (res_split.length-1); i > i_Objs; i--) {
      if(i == (res_split.length-1)){
        odf_pay.payload = createODF_InfoItemRead(res_split[i],"with");
      }else{
        odf_pay.payload = createODF_Object(odf_pay.payload,res_split[i]);
      }
    }
  }

  return odf_pay;
};

/*Creation of the O-DF payload of a Write request based on the following input parameters:
@path (entered in Node-Red UI): corresponding to the O-DF hierarchy, up to the InfoItem name to be written
@valueInfotItem: Value of the InfoItem to be written, if any (indeed, Write operation can also be used to create a new branch in the O-DF hierarchy if needed)
*/
function createODF_write(path,valueInfoItem) {
  var odf_pay = {payload: "", err: ""};
  var i_Objs;

  var res_split = path.split("/");

  for (i = 0; i <= res_split.length; i++) { 
    if (res_split[i]=="Objects")
      i_Objs=i;
  }

  if (i_Objs==undefined){
    odf_pay.err = "The InfoItem Path is not correct because it doesn't contain 'Objects'";
  } else{
    for (i = (res_split.length-1); i > i_Objs; i--) {
      if(i == (res_split.length-1)){
        valueInfoItem_XML = createODF_Value(valueInfoItem);
        odf_pay.payload = createODF_InfoItemWrite(res_split[i],valueInfoItem_XML);
      }else{
        odf_pay.payload = createODF_Object(odf_pay.payload,res_split[i]);
      }
    }
  }

  return odf_pay;
};

/*Creation of the O-DF payload related to an InfoItem whose name AND value are entered as input parameters:
@payload_elem (entered in Node-Red UI): Name of the InfoItem to be "written";
@valueInfoItem_XML (entered in Node-Red UI): Value of the InfoItem to be "written";
*/
function createODF_InfoItemWrite(payload_elem,valueInfoItem_XML) {
  var OpenTag_InfoItem= '<InfoItem name="';
  var CloseTagInterm_InfoItem= '">';
  var CloseTag_InfoItem= '</InfoItem>';
  payload_elem = OpenTag_InfoItem.concat(payload_elem,CloseTagInterm_InfoItem,valueInfoItem_XML,CloseTag_InfoItem);
  
  return payload_elem;
};

/*Creation of the O-DF payload related to the InfoItem's value to be written:
@valueInfoItem_XML (entered in Node-Red UI): Value of the InfoItem to be "written";
*/
function createODF_Value(valueInfoItem) {
  var Tag_Value_unixTime= '<value unixTime="';
  var unixtime = Math.round(+new Date()/1000);
  var Tag_Value_dateTime= '" dateTime="';
  var datetime = new Date().toISOString();
  var Tag_Value_Type= '" type="xs:string">';
  var CloseTag_InfoItem= '</value>';
  var payload_elem = Tag_Value_unixTime.concat(unixtime,Tag_Value_dateTime,datetime,Tag_Value_Type,valueInfoItem,CloseTag_InfoItem);

  return payload_elem;
};


/*Creation of the O-DF payload of a Cancel request based on the following input parameters
@reqID (entered in Node-Red UI): request ID to be canceled (ID received in an O-MI/O-DF response when ininitiating the subscription)
*/
function createODF_poll(reqID) {
  var odf_pay = {payload: "", err: ""};

  if (reqID==""){
    odf_pay.err = "The Request ID has not been filled out";
  } else{
    var OpenTag_Cancel= '<requestID xmlns="omi.xsd">';
    var CloseTag_Cancel= '</requestID>';
    odf_pay.payload = OpenTag_Cancel.concat(reqID,CloseTag_Cancel);
  }

  return odf_pay;
};

/*Creation of the O-DF payload of a Cancel request based on the following input parameters
@reqID (entered in Node-Red UI): request ID to be canceled (ID received in an O-MI/O-DF response when ininitiating the subscription)
*/
function createODF_cancel(reqID) {
  var odf_pay = {payload: "", err: ""};

  if (reqID==""){
    odf_pay.err = "The Request ID has not been filled out";
  } else{
    var OpenTag_Cancel= '<requestID>';
    var CloseTag_Cancel= '</requestID>';
    odf_pay.payload = OpenTag_Cancel.concat(reqID,CloseTag_Cancel);
  }

  return odf_pay;
};

/*Creation of the O-DF payload related to an InfoItem whose name is entered as input parameter:
@payload_elem: Name of the InfoItem to be "read" (related on the Path entered in Node-Red UI)
*/
function createODF_InfoItemRead(InfoItemName,str) {
  var OpenTag_InfoItem= '<InfoItem name="';
  var CloseTag_InfoItem;

  if (str=="with"){
    CloseTag_InfoItem= '"><MetaData/></InfoItem>';
  } else {
    CloseTag_InfoItem= '"/>';
  }

  var payload_elem = OpenTag_InfoItem.concat(InfoItemName,CloseTag_InfoItem);
  return payload_elem;
};

/*Creation of the O-DF payload related to an Object whose name (=id) is entered as input parameter:
@id_obj: Name (referred to as ID in O-DF standard) of the Object
@payload_elem: content of the Object that corresponds to the set of InfoItems or sbu-Objects from an O-DF hierarchy viewpoint
*/
function createODF_Object(payload_elem,id_obj) {
  var OpenTag_Object = '<Object><id>';
  var CloseTag_ObjectID = '</id>';
  var CloseTag_Object = '</Object>';
  payload_elem = OpenTag_Object.concat(id_obj,CloseTag_ObjectID,payload_elem,CloseTag_Object);

  return payload_elem;
};


module.exports = omiNodecons;
