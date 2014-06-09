module.exports = (function(getTLIdEncoderDecoder) {

	"use strict";

	var SseCommunication = function() {
		this.channels = {};
		this.eventId = 0;
	};

	var tLIdEncoderDecoder = getTLIdEncoderDecoder(new Date(2014, 6, 14, 11, 51, 0).getTime(), 4);

	SseCommunication.prototype.register = function(deviceId, channels, res) {
		for (var i=0; i<channels.length; i++) {
			if (!this.channels.hasOwnProperty(channels[i])) {
				this.channels[channels[i]] = {};
			}
			this.channels[channels[i]][deviceId] = res;
		}

		var keepAlive = function() {
			var out = [
				'id: 0',
				"data: " + JSON.stringify({ command: 'keep-alive' })
			];
			res.write(out.join("\n") + "\n\n");
		};

		(function() {
			/* global setInterval: false */
			keepAlive();
			setInterval(function() { keepAlive(); }, 1000*60);
		})();

	};

	SseCommunication.formatMessage = function(command, data) {
		return [
			'id: ' + tLIdEncoderDecoder.encode(),
			"data: " + JSON.stringify({ command: command, data: data })
		].join("\n") + "\n\n";
	};

	SseCommunication.prototype.send = function(fromDeviceId, channelId, command, data) {
		if (!this.channels.hasOwnProperty(channelId)) { return 0; }
		for (var deviceId in this.channels[channelId]) {
			if (this.channels[channelId].hasOwnProperty(deviceId)) {
				if (deviceId !== fromDeviceId) {
					this.channels[channelId][deviceId].write(
						SseCommunication.formatMessage(command, data)
					);
				}
			}
		}
	};

	return SseCommunication;

}(require('get_tlid_encoder_decoder')));
