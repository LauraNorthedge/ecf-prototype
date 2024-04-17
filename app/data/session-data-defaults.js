module.exports = {

  notification: {
    show: false,
    type: null,
    email: null
  },
  users: [
    {
      id: 0,
      firstName: "Sheena",
      lastName: "Newman",
      emailAddress: "sheena@rbcouncil.org.uk",
      type: 'nqsw',
      regNumber: "SW2478"
    },
    {
      id: 1,
      firstName: "Joe",
      lastName: "Bloggs",
      emailAddress: "joe@rbcouncil.org.uk",
      type: 'coordinator',        
    },
    {
      id: 2,
      firstName: "Laura",
      lastName: "Barn",
      emailAddress: "laura@rbcouncil.org.uk",
      type: 'nqsw',
    },
    {
      id: 3,
      firstName: "Ricardo",
      lastName: "Athanasopoulos",
      emailAddress: "ricardo@rbcouncil.org.uk",
      type: 'assessorCoordinator',
    },
    {
      id: 4,
      firstName: "Yavuz",
      lastName: "Karci",
      emailAddress: "Yavuz@rbcouncil.org.uk",
      type: 'nqsw',
      status: "not_linked",
      regNumber: "SW142"
    }
  ],
  userTypes: {
    admin: "Administrator", 
    assessor: "Assessor", 
    coordinator: "Coordinator",
    nqsw: "Newly qualified social worker", 
    assessorCoordinator: "Assessor, Coordinator"
  }

}
