var request = require('supertest');
var expect = require('chai').expect;

describe('Status', () => {
    it('should return info', function (done) {
      request(sails.hooks.http.app)
        .get('/')
        .set('Accept', 'application/json')
        .expect(200)
        .expect('Content-Type', /json/)
        .expect((res)=> {
            bodyCheck(res.body,'status')
        })
        .end(done);
    });
});

describe('Tokens', () => {

    it ('should only allow valid psk',(done)=>{
      request(sails.hooks.http.app)
        .get('/tokens')
        .expect((res)=> {
            bodyCheck(res.body,{
                msg:'name',
                data:'regex'
            });
        })
        .expect(403,done);
    });

    it('should return valid token list', function (done) {
      request(sails.hooks.http.app)
        .get('/tokens')
        .query({ psk: process.env.PRE_SHARED_KEY })        
        .set('Accept', 'application/json')
        .expect(200)
        .expect('Content-Type', /json/)
        .expect((res)=> {
          _.each (res.body.tokens,(d)=>{
              bodyCheck(d,{
                  name:'name',
                  regex:'regex'
              });
          });
        })
        .end(done);
    });
});

describe('Services', () => {

    it ('should only allow valid psk',(done)=>{
      request(sails.hooks.http.app)
        .get('/services')
        .expect((res)=> {
            bodyCheck(res.body,{
                msg:'name',
                data:'regex'
            });
        })
        .expect(403,done);
    });

    it('should return valid service list', function (done) {
      request(sails.hooks.http.app)
        .get('/services')
        .query({ psk: process.env.PRE_SHARED_KEY })
        .set('Accept', 'application/json')
        .expect(200)
        .expect('Content-Type', /json/)
        .expect((res)=> {
          _.each (res.body.tokens,(d)=>{
              bodyCheck(d,{
                  name:'name',
                  tag:'regex'
              });
          });
        })
        .end(done);
    });
});

describe('Messages', () => {

  describe('Subscribe', () =>{
    it ('should only allow valid psk',(done)=>{
      request(sails.hooks.http.app)
        .post('/messages/subscribe/0/0')
        .expect((res)=> {
            bodyCheck(res.body,{
                msg:'name',
                data:'regex'
            });
        })
        .expect(403,done);
    });
  });


  describe('List', () =>{

    it ('should only allow valid psk',(done)=>{
      request(sails.hooks.http.app)
        .post('/messages/list/0/0')
        .expect((res)=> {
            bodyCheck(res.body,{
                msg:'name',
                data:'regex'
            });
        })
        .expect(403,done);
    });

  });  

  describe('Totals', () =>{
    it ('should only allow valid psk',(done)=>{
      request(sails.hooks.http.app)
        .post('/messages/totals')
        .expect((res)=> {
            bodyCheck(res.body,{
                msg:'name',
                data:'regex'
            });
        })
        .expect(403,done);
    });
  });

  describe('Visualisation', () =>{
    it ('should only allow valid psk',(done)=>{
      request(sails.hooks.http.app)
        .post('/messages/visualisation')
        .expect((res)=> {
            bodyCheck(res.body,{
                msg:'name',
                data:'regex'
            });
        })
        .expect(403,done);
    });
  });

});