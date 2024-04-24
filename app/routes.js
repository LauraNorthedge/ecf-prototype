//
// For guidance on how to create routes see:
// https://prototype-kit.service.gov.uk/docs/create-routes
//

const govukPrototypeKit = require("govuk-prototype-kit");
const router = govukPrototypeKit.requests.setupRouter();

// =======================================
// Data and functions
// =======================================

function sortUsers(req) {
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
  return users.find((user) => user.id == id);
}

function isUserCoordinator(user) {
  return user.type == "coordinator" || user.type == "assessorCoordinator";
}

function redirect(req, res, url) {
  return req.session.save(() => res.redirect(url));
}

// =======================================
// Routes
// =======================================

// --- One login ---

router.post("/one-login", function (req, res) {
  return res.redirect("/welcome");
});

// --- Org admin ---

router.get("/org-admin", function (req, res) {
  const data = req.session.data;
  const notification = data.notification;

  data.editing = undefined;
  data.emailAddress = undefined;
  data.firstName = undefined;
  data.id = undefined;
  data.lastName = undefined;
  data.regNumber = undefined;
  data.success = undefined;
  data.usertype = undefined;
  data.notification = undefined;

  sortUsers(req);

  return res.render("/org-admin", { notification });
});

// --- Select user type ---

router.get(/select-user-type/, function (req, res) {
  const user = req.query.editing
    ? getUserByID(req.session.data.users, req.query.id)
    : undefined;

  return res.render("/account-creation-org-admin/select-user-type", {
    user: user,
  });
});

router.post(/select-user-type/, function (req, res) {
  const data = req.session.data;
  // Nothing was selected
  if (data.usertype === undefined) {
    return redirect(req, res, "/account-creation-org-admin/select-user-type");
  }

  // Add or update user details
  if (!data.id)
    return redirect(req, res, `/account-creation-org-admin/add-user`);

  const user = getUserByID(data.users, data.id);

  user.type = data.usertype;

  return redirect(
    req,
    res,
    `/account-creation-org-admin/update-user?id=${data.id}&success=true`
  );
});

// --- Add user ---

router.get("/account-creation-org-admin/add-user", function (req, res) {
  const user = req.query.editing
    ? getUserByID(req.session.data.users, req.query.id)
    : undefined;

  return res.render("/account-creation-org-admin/add-user", { user });
});

function updateUser(req, res) {
  const data = req.session.data;
  const user = getUserByID(data.users, data.id);

  user.firstName = data.firstName;
  user.lastName = data.lastName;
  user.emailAddress = data.emailAddress;
  user.regNumber = data.regNumber;

  data.notification = {
    show: true,
    type: "account_updated",
    email: data.emailAddress,
  };
  return redirect(
    req,
    res,
    `/account-creation-org-admin/update-user?id=${data.id}`
  );
}

router.post("/account-creation-org-admin/add-user", function (req, res) {
  const data = req.session.data;
  // Add or update user details
  if (data.id) return updateUser(req, res);

  data.users.push({
    emailAddress: data.emailAddress,
    firstName: data.firstName,
    id: data.users.length,
    lastName: data.lastName,
    type: data.usertype,
  });

  data.notification = {
    show: true,
    type: "account_added",
    email: data.emailAddress,
  };

  return redirect(req, res, "/org-admin");
});

// --- Update user ---

router.get(
  "/account-creation-org-admin/update-user",
  function ({ session, query }, res) {
    const data = session.data;
    const user = data.users.filter((user) => user.id == query.id)[0];

    const notification = data.notification;
    data.notification = undefined;

    return res.render("/account-creation-org-admin/update-user", {
      user,
      notification,
    });
  }
);

// --- Unlink user ---

router.get(/unlink-user/, function (req, res) {
  const data = req.session.data;
  const user = getUserByID(data.users, data.id);

  user.status = "not_linked";
  data.notification = {
    show: true,
    type: "account_unlinked",
    email: user.emailAddress,
  };

  return redirect(req, res, `/org-admin`);
});

// --- Link user ---

router.get(/link-user/, function (req, res) {
  const data = req.session.data;
  const user = getUserByID(data.users, data.id);

  user.status = undefined;
  data.notification = {
    show: true,
    type: "account_linked",
    email: user.emailAddress,
  };

  return redirect(req, res, `/org-admin`);
});

// --- Deactivate account ---

router.get(/deactivate-account/, function (req, res) {
  const data = req.session.data;
  const user = getUserByID(data.users, req.query.id);

  if (!isUserCoordinator(user)) return res.send(403);

  let countCoordinators = 0;
  data.users.forEach((user) => {
    if (user.status !== "deactivated" && isUserCoordinator(user)) {
      countCoordinators++;
    }
  });

  if (countCoordinators === 1)
    return redirect(req, res, "/account-creation-org-admin/cannot-deactivate");

  user.status = "deactivated";
  data.notification = {
    show: true,
    type: "account_deactivated",
    email: user.emailAddress,
  };

  return redirect(req, res, `/org-admin`);
});

module.exports = router;
