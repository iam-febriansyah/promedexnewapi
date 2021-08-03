"use strict";
const db = require("../config/db.config.js");
const request = require('request');

module.exports.pushNotification = async function pushNotification(req, dataUser) {
    try {
        var notification = {
            title: req.title,
            body: req.body,
            click_action: req.click_action,
        }
        var data = req.data;
        var requestData = {
            to: dataUser.user.fcm_token,
            notification: notification,
            priority: "high",
            data: data
        }
        const options = {
            method: 'POST',
            url: db.FCM_URL,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': db.FCM_TOKEN
            },
            body: requestData,
            json: true
        }

        return new Promise((resolve, reject) => {
            request(options, (error, response, data) => {
                if (!error && response.statusCode == 200) {
                    var status = true;
                    var remarks = "Successfully";
                    var data = response.body;
                } else {
                    var status = false;
                    var remarks = error;
                    var data = null;
                }
                console.log(response.body)
                resolve(data);
            });
        });
    } catch (e) {
        console.log("============================================")
        response = { status: false, statusCode: 500, message: e.message }
        console.log(response)
        return response;
    }
}

module.exports.pushNotificationMultiple = async function pushNotificationMultiple(req, registration_ids) {
    try {
        var notif = {
            title: req.title,
            body: req.body,
            click_action: req.click_action,
            vibrate: 1,
            sound: 1
        }
        var data = req.data;
        var requestData = {
            registration_ids: registration_ids,
            priority: "high",
            notification: notif,
            data: data
        }
        const options = {
            method: 'POST',
            url: db.FCM_URL,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': db.FCM_TOKEN
            },
            body: requestData,
            json: true
        }

        return new Promise((resolve, reject) => {
            request(options, (error, response, data) => {
                if (!error && response.statusCode == 200) {
                    var status = true;
                    var remarks = "Successfully";
                    var data = response.body;
                } else {
                    var status = false;
                    var remarks = error;
                    var data = null;
                }
                console.log(response.body)
                resolve(data);
            });
        });
    } catch (e) {
        response = { status: false, statusCode: 500, message: e.message }
        return response;
    }
}
