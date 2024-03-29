/*jshint smarttabs:true */
(function (root, factory) {

	"use strict";

	if (typeof exports === 'object') {
		// Node. Does not work with strict CommonJS, but
		// only CommonJS-like enviroments that support module.exports,
		// like Node.
		module.exports = factory(
			require('expect.js'),
			require('../Simple.js')
		);
	} else {
		// AMD. Register as an anonymous module.
		define(
			[
				'../Simple.js'
			],
			factory.bind(this, expect)
		);
	}
}(this, function (
	expect,
	SseCommunication
) {

"use strict";

describe('SseCommunication', function() {
	it('Will communicate only with peers', function() {
		var sse = new SseCommunication();

		var Res = function() { this.recvd = []; };
		Res.prototype.write = function(str) { this.recvd.push(str); };

		var reses = {
			'a': new Res(),
			'b': new Res(),
			'c': new Res()
		};

		var stripKeepAlive = function(ar) {
			return ar.filter(function(s) {
				return s.match(/keep\-alive/) ? false : true;
			});
		};

		var getId = function(msg) {
			return msg.replace(/^[^\:]+\: /,'').replace(/[^A-Za-z0-9\-].*/,'');
		};

		sse.register('a', ['Q', 'W', 'E'], reses.a);
		sse.register('b', ['Q', 'E'], reses.b);
		sse.register('c', ['E'], reses.c);

		sse.send('b', 'E', 'message', {hi: 'jack'});
		expect(stripKeepAlive(reses.a.recvd).length).to.equal(1);
		expect(stripKeepAlive(reses.b.recvd).length).to.equal(0);
		expect(stripKeepAlive(reses.c.recvd).length).to.equal(1);

		sse.send('c', 'W', 'message', {hi: 'fred'});
		expect(stripKeepAlive(reses.a.recvd).length).to.equal(2);
		expect(stripKeepAlive(reses.b.recvd).length).to.equal(0);
		expect(stripKeepAlive(reses.c.recvd).length).to.equal(1);
		expect(getId(reses.c.recvd[0]) < (reses.a.recvd[1])).to.equal(true);
	});
});

}));
