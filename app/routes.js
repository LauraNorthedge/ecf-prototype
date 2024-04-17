//
// For guidance on how to create routes see:
// https://prototype-kit.service.gov.uk/docs/create-routes
//

const govukPrototypeKit = require('govuk-prototype-kit')
const router = govukPrototypeKit.requests.setupRouter()

// =======================================
// Routes for all versions
// =======================================

// --- Route topnav links to correct version --

router.get('/welcome', function(req, res) {

  let versionPath = '/v';

	if (req.session.data.version) {
    versionPath += Math.floor(req.session.data.version);
  } else {
    versionPath += '1';
  }

  res.redirect(versionPath + "/welcome");

});

router.get('/org-admin', function(req, res) {

  let versionPath = '/v';

	if (req.session.data.version) {
    versionPath += Math.floor(req.session.data.version);
  } else {
    versionPath += '1';
  }

  res.redirect(versionPath + "/org-admin");

});


// =======================================
// Version Routes Files Below
// =======================================

// Iterations
router.use('/v1', require('./views/v1/_routes'));
router.use('/v2', require('./views/v2/_routes'));

module.exports = router;