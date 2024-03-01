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
    assessor_coordinator: "Assessor/Coordinator"};

var arrUsers = [
    {
        fname: "Sheena",
        lname: "Newman",
        email: "sheena@somecouncil.org.uk",
        type: oUserTypes['nqsw'],
        reg_number: "SW2478"
    },{
        fname: "Joe",
        lname: "Blogg",
        email: "joe@somecouncil.org.uk",
        type: oUserTypes['coordinator']
    },{
        fname: "Laura",
        lname: "Barn",
        email: "laura@somecouncil.org.uk",
        type: oUserTypes['nqsw'],
        status: "Missing registration number",
        reason: "You have not provided a Social Work England registration number for this account"
    },{
        fname: "Ricardo",
        lname: "Athanasopoulos",
        email: "ricardo@somecouncil.org.uk",
        type: oUserTypes['assessor_coordinator']
    },{
        fname: "Yavuz",
        lname: "Karci",
        email: "Yavuz@somecouncil.org.uk",
        type: oUserTypes['nqsw'],
        status: "Not linked",
        reg_number: "SW142",
        reason: "This account is no longer linked to this organisation"
    }
]

router.get('/account-creation-org-admin', function(req, res) {

    var show_notification = undefined;
    if (req.query.success)
        show_notification = req.query.success;

    res.render('account-creation-org-admin/index', {show_notification: show_notification, users: arrUsers});
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
        res.redirect('/account-creation-org-admin/update-user?id='+req.body.id);
    else
        res.redirect('/account-creation-org-admin/add-user/?usertype='+req.body.usertype)
});

router.get('/account-creation-org-admin/add-user', function(req, res) {
    var id = undefined;
    var user = undefined;

    if (req.query.editing){
        id = req.query.id;
        user = arrUsers[id];
    }
    res.render('account-creation-org-admin/add-user', {id: id, user: user, user_type: req.query.usertype});
});

router.post('/account-creation-org-admin/add-user', function(req, res) {
    if (req.body.id)
        res.redirect('/account-creation-org-admin/update-user?id='+req.body.id);
    else
        res.redirect('/account-creation-org-admin/?success=user_added');
});


router.get('/account-creation-org-admin/update-user', function(req, res) {
    var id = req.query.id;
    res.render('account-creation-org-admin/update-user', {id:id, user: arrUsers[id], user_types: oUserTypes});
});
