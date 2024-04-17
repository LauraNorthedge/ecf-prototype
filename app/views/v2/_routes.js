//
// For guidance on how to create routes see:
// https://prototype-kit.service.gov.uk/docs/create-routes
//

const govukPrototypeKit = require('govuk-prototype-kit')
const router = govukPrototypeKit.requests.setupRouter()

// =======================================
// Data and functions
// =======================================

function sortUsers(req){
	req.session.data.users.sort(function (a, b) {
		if (a.firstName < b.firstName) {
			return -1;
		}
		if (a.firstName > b.firstName) {
			return 1;
		}
		return 0;
	});
}

function getUserByID(users, id) {
	return users.filter(user => user.id == id)[0];
}

// =======================================
// Routes
// =======================================

// --- Start ---

router.get('start', function(req, res) {

	req.session.data.version = req.query.version;
	res.render('/v2/start');

});

// --- One login ---

router.post('/one-login', function(req, res) {

	if(req.session.data.version == '1.1')
		res.redirect("/v2/welcome");
	else 
		res.redirect("/v2/one-login/enter-password");

	});

// --- Org admin ---

router.get('/org-admin', function(req, res) {

	req.session.data.editing = null;
	req.session.data.emailAddress = null;
	req.session.data.firstName = null;
	req.session.data.id = null;
	req.session.data.lastName = null;
	req.session.data.regNumber = null;
	// req.session.data.notification.show = null;
	req.session.data.success = null;
	req.session.data.usertype = null;

	if (req.session.data.notification.show) {
		// req.session.data.notification.show = false;
	}

	sortUsers(req);

	res.render('/v2/org-admin');

});

// --- Select user type ---

router.get(/select-user-type/, function(req, res) {

	// req.session.data.id = null;
	req.session.data.notification.show = false;

	const user = req.query.editing ? getUserByID(req.session.data.users, req.query.id) : undefined;

	res.render('/v2/account-creation-org-admin/select-user-type', { user: user});

});

router.post(/select-user-type/, function(req, res) {

	req.session.data.notification.show = false;

	// Nothing was selected
	if (req.session.data.usertype == undefined) {
		res.redirect('/v2/account-creation-org-admin/select-user-type')
	}

	// Add or update user details
	if (req.session.data.id) {

		const index = req.session.data.users.findIndex(user => user.id == req.session.data.id);

		req.session.data.users[index].type = req.session.data.usertype;

		res.redirect(`/v2/account-creation-org-admin/update-user?id=${req.session.data.id}&success=true`);

	} else {

		res.redirect(`/v2/account-creation-org-admin/add-user`);

	}

});

// --- Add user ---

router.get('/account-creation-org-admin/add-user', function(req, res) {

	const user = req.query.editing ? getUserByID(req.session.data.users, req.query.id) : undefined;

	res.render('/v2/account-creation-org-admin/add-user', {user: user});

});

router.post('/account-creation-org-admin/add-user', function(req, res) {

	// Add or update user details
	if (req.session.data.id) {

		const index = req.session.data.users.findIndex(user => user.id == req.session.data.id);
		
		req.session.data.users[index].firstName = req.session.data.firstName;
		req.session.data.users[index].lastName = req.session.data.lastName;
		req.session.data.users[index].emailAddress = req.session.data.emailAddress;
		if (req.session.data.regNumber != '') {
			req.session.data.users[index].regNumber = req.session.data.regNumber;
		}

		res.redirect(`/v2/account-creation-org-admin/update-user?id=${req.session.data.id}`);

	} else {

		let user = {
			emailAddress: req.session.data.emailAddress,
			firstName: req.session.data.firstName,
			id: req.session.data.users.length,
			lastName: req.session.data.lastName,
			type: req.session.data.usertype,
		}

		req.session.data.users.push(user);

		req.session.data.notification.show = true;
		req.session.data.notification.type = 'account_added';
		req.session.data.notification.email = user.emailAddress;

		res.redirect(`/v2/org-admin?id=${req.body.id}`);

	}

});

// --- Update user ---

router.get(/update-user/, function(req, res) {

	req.session.data.notification.show = false;

	const user = req.session.data.users.filter(user => user.id == req.query.id)[0];

	// Does this ever get triggered?
	if (req.query.success) {
		req.session.data.notification.show = true;
		req.session.data.notification.type = 'success';
		req.session.data.notification.email = user.emailAddress;
	}

	res.render('/v2/account-creation-org-admin/update-user', {user: user});

});

// --- Unlink user ---

router.get(/unlink-user/, function(req, res) {

	const index = req.session.data.users.findIndex(user => user.id == req.session.data.id);

	req.session.data.users[index].status = "not_linked";
	req.session.data.notification.show = true;
	req.session.data.notification.type = 'account_unlinked';
	req.session.data.notification.email = req.session.data.users[index].emailAddress;
	
	res.redirect(`/v2/org-admin?id=${req.query.id}`);
	
});

// --- Link user ---

router.get(/link-user/, function(req, res) {

	const index = req.session.data.users.findIndex(user => user.id == req.session.data.id);

	req.session.data.users[index].status = undefined;
	req.session.data.notification.show = true;
	req.session.data.notification.type = 'account_linked';
	req.session.data.notification.email = req.session.data.users[index].emailAddress;

	res.redirect(`/v2/org-admin?id=${req.query.id}`);

});

// --- Deactivate account ---

router.get(/deactivate-account/, function(req, res) {

	const user = getUserByID(req.session.data.users, req.query.id);

	if (user.type == "coordinator" || user.type == "assessorCoordinator") {

		let countCoordinators = 0;
		req.session.data.users.forEach(user => {
			if (user.status != "deactivated" && (user.type == "coordinator" || user.type == "assessorCoordinator")) {
				countCoordinators++;
			}
		});

		if (countCoordinators == 1) {

			res.redirect('/v2/account-creation-org-admin/cannot-deactivate');

		} else {

			const index = req.session.data.users.findIndex(user => user.id == req.session.data.id);

			req.session.data.users[index].status = "deactivated";
			req.session.data.notification.show = true;
			req.session.data.notification.type = 'account_deactivated';
			req.session.data.notification.email = req.session.data.users[index].emailAddress;

			res.redirect(`/v2/org-admin?id=${req.query.id}`);

		}

	}

});

module.exports = router;