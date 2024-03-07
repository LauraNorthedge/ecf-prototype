//
// For guidance on how to create routes see:
// https://prototype-kit.service.gov.uk/docs/create-routes
//

const govukPrototypeKit = require('govuk-prototype-kit')
const router = govukPrototypeKit.requests.setupRouter()

// Add your routes here

const oUserTypes = {
    admin: "Administrator", 
    assessor: "Assessor", 
    coordinator: "Coordinator",
    nqsw: "Newly qualified social worker", 
    assessorCoordinator: "Assessor, Coordinator"};

var arrUsers = [
    {
        firstName: "Sheena",
        lastName: "Newman",
        emailAddress: "sheena@rbcouncil.org.uk",
        type: 'nqsw',
        regNumber: "SW2478"
    },{
        firstName: "Joe",
        lastName: "Bloggs",
        emailAddress: "joe@rbcouncil.org.uk",
        type: 'coordinator',        
    },{
        firstName: "Laura",
        lastName: "Barn",
        emailAddress: "laura@rbcouncil.org.uk",
        type: 'nqsw',
    },{
        firstName: "Ricardo",
        lastName: "Athanasopoulos",
        emailAddress: "ricardo@rbcouncil.org.uk",
        type: 'assessorCoordinator',
    },{
        firstName: "Yavuz",
        lastName: "Karci",
        emailAddress: "Yavuz@rbcouncil.org.uk",
        type: 'nqsw',
        status: "not_linked",
        regNumber: "SW142"
    }
]


router.get('/start', function(req, res) {
    req.session.version = req.query.version;
    req.session.users = arrUsers;
    res.render('start');
});

router.post('/one-login', function(req, res) {
    if(req.session.version == '1.1')
        res.redirect("/welcome");
    else 
        res.redirect("/one-login/enter-password");
});


router.get('/account-creation-org-admin', function(req, res) {

    var show_notification = undefined;
    var user = undefined;
    var users = req.session.users;

    if (req.query.show_notification) {
        show_notification = req.query.show_notification;
        user = users[req.query.user_id];
    }

    sortUsers(req);

    res.render('account-creation-org-admin/index', {show_notification: show_notification, users: users, user: user, user_types: oUserTypes});
});

router.get('/account-creation-org-admin/select-user-type', function(req, res) {
    var id = undefined;
    var user = undefined;
    if (req.query.editing){
        id = req.query.id;
        user = req.session.users[id];
    }
        
    res.render('account-creation-org-admin/select-user-type', {id: id, user: user, user_types: oUserTypes});
});

router.post('/account-creation-org-admin/select-user-type', function(req, res) {
    if (req.body.usertype == undefined)
        res.redirect('/account-creation-org-admin/select-user-type')


    if (req.body.id){
        var id = req.body.id;
        var user = req.session.users[id];
        user.type = req.body.usertype;

        res.redirect(`/account-creation-org-admin/update-user?id=${req.body.id}&success=true`);
    } else {
        var user = {};
        user.type = req.body.usertype;
        user.new_account = true;
        req.session.users.push(user);
        id = req.session.users.length-1;

        res.redirect(`/account-creation-org-admin/add-user/?id=${id}`);
    }
});

router.get('/account-creation-org-admin/add-user', function(req, res) {
    var id = req.query.id;
    var user = req.session.users[id];
    user_type = user.type
   

    res.render('account-creation-org-admin/add-user', {id: id, user: user, user_type: user_type});
});

router.post('/account-creation-org-admin/add-user', function(req, res) {

    var user = req.session.users[req.body.id];

    user.firstName = req.body.firstName;
    user.lastName = req.body.lastName;
    user.emailAddress = req.body.emailAddress;
    if (req.body.regNumber != '')
        user.regNumber = req.body.regNumber;
    
    if (user.new_account == true) {
        user.new_account = false;
        res.redirect(`/account-creation-org-admin/?show_notification=account_added&user_id=${req.body.id}`);
    } else {
        res.redirect(`/account-creation-org-admin/update-user?id=${req.body.id}`);
    }
});


router.get('/account-creation-org-admin/update-user', function(req, res) {
    var id = req.query.id;
    var show_notification = undefined;

    if (req.query.success)
        show_notification = req.query.success;

    res.render('account-creation-org-admin/update-user', {id:id, user: req.session.users[id], user_types: oUserTypes, show_notification: show_notification});
});

router.get('/link-user', function(req, res) {
    var id = req.query.id;
    req.session.users[id].status = undefined;

    res.redirect(`/account-creation-org-admin/?show_notification=account_linked&user_id=${id}`);
});

router.get('/unlink-user', function(req, res) {
    var id = req.query.id;
    req.session.users[id].status = "not_linked";

    res.redirect(`/account-creation-org-admin/?show_notification=account_unlinked&user_id=${id}`);
});

router.get('/deactivate-account', function(req, res) {
    var id = req.query.id;
    var accountToDeactivate = req.session.users[id];
    if(accountToDeactivate.type == "coordinator" || accountToDeactivate.type == "assessorCoordinator"){
        var countCoordinators = 0;
        req.session.users.forEach(user => {
            if (user.status != "deactivated" && (user.type == "coordinator" || user.type == "assessorCoordinator"))
                countCoordinators++;
        });

        if(countCoordinators == 1){
            res.redirect('/account-creation-org-admin/cannot-deactivate');
        } else {
            req.session.users[id].status = "deactivated";
            res.redirect(`/account-creation-org-admin/?show_notification=account_deactivated&user_id=${id}`);
        }
    }


    // res.redirect('/account-creation-org-admin/?success=dissociated');
});

function sortUsers(req){
    req.session.users.sort(function (a, b) {
        if (a.firstName < b.firstName) {
            return -1;
        }
        if (a.firstName > b.firstName) {
            return 1;
        }
        return 0;
    });
}

  