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
        emailAddress: "sheena@somecouncil.org.uk",
        type: 'nqsw',
        regNumber: "SW2478"
    },{
        firstName: "Joe",
        lastName: "Blogg",
        emailAddress: "joe@somecouncil.org.uk",
        type: 'coordinator',        
    },{
        firstName: "Laura",
        lastName: "Barn",
        emailAddress: "laura@somecouncil.org.uk",
        type: 'nqsw',
        status: "Missing registration number",
        reason: "You have not provided a Social Work England registration number for this account"
    },{
        firstName: "Ricardo",
        lastName: "Athanasopoulos",
        emailAddress: "ricardo@somecouncil.org.uk",
        type: 'assessorCoordinator',
    },{
        firstName: "Yavuz",
        lastName: "Karci",
        emailAddress: "Yavuz@somecouncil.org.uk",
        type: 'nqsw',
        status: "Not linked",
        regNumber: "SW142",
        reason: "This account is no longer linked to this organisation"
    }
]

sortUsers();

router.get('/start', function(req, res) {
    req.session.version = req.query.version;
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
    if (req.query.success)
        show_notification = req.query.success;

    res.render('account-creation-org-admin/index', {show_notification: show_notification, users: arrUsers, user_types: oUserTypes});
});

router.get('/account-creation-org-admin/select-user-type', function(req, res) {
    var id = undefined;
    var user = undefined;
    if (req.query.editing){
        id = req.query.id;
        user = arrUsers[id];
    }
        
    res.render('account-creation-org-admin/select-user-type', {id: id, user: user, user_types: oUserTypes});
});

router.post('/account-creation-org-admin/select-user-type', function(req, res) {
    if (req.body.usertype == undefined)
        res.redirect('/account-creation-org-admin/select-user-type')

    if (req.body.id)
        res.redirect(`/account-creation-org-admin/update-user?id=${req.body.id}&success=true`);
    else
        res.redirect('/account-creation-org-admin/add-user/?usertype='+req.body.usertype)
});

router.get('/account-creation-org-admin/add-user', function(req, res) {
    var id = undefined;
    var user = undefined;

    if(req.query.usertype)
        user_type = req.query.usertype; 

    if (req.query.editing){
        id = req.query.id;
        user = arrUsers[id];
        user_type = user.type
    }



    res.render('account-creation-org-admin/add-user', {id: id, user: user, user_type: user_type});
});

router.post('/account-creation-org-admin/add-user', function(req, res) {
    if (req.body.id) {
        res.redirect('/account-creation-org-admin/update-user?id='+req.body.id);
    } else {
        var fname = req.body.firstName;
        var lname = req.body.lastName;
        var email = req.body.emailAdress;
        var type = req.body.userType;
        var reg_number = req.body.regnumber;
         console.log(req.body)

        res.redirect('/account-creation-org-admin/?success=user_added');
    }
});


router.get('/account-creation-org-admin/update-user', function(req, res) {
    var id = req.query.id;
    var show_notification = undefined;

    if (req.query.success)
        show_notification = req.query.success;

    res.render('account-creation-org-admin/update-user', {id:id, user: arrUsers[id], user_types: oUserTypes, show_notification: show_notification});
});


function sortUsers(){
    arrUsers.sort(function (a, b) {
        if (a.fname < b.fname) {
            return -1;
        }
        if (a.fname > b.fname) {
            return 1;
        }
        return 0;
    });
}

  