describe('Users can visit the homepage and navigate', () => {
  beforeEach(()=> {
    cy.visit('http://localhost:3000')
    cy.intercept(
      "GET",
      "https://8c3a0c1f-6f70-4e2c-82aa-c8e6de99ae51.mock.pstmn.io/api/v1/users/1/projects",
      {
        statusCode: 200,
        body: { },
        //what is this request getting?? come back and fill out later once we have real data
      }
    ).as("projects");
  })

  it('Should be able to go to homepage', () => {
    cy.url().should("include", "/")
    .get('.app-logo > img').should('be.visible')
    .get('.light').should('be.visible')
    .get('h1').should('have.text', 'Welcome to Project Planner')
    .get('button.popup-button').should('have.text', 'View Tutorial')
    .get('a.popup-button').should('have.text', 'Generate New Project Plan')
  })

  it('Should be able to navigate to other pages', () => {
    cy.get('.clear-bg-btn > img').click()
    cy.get('[href="/"] > .clear-bg-btn').should('have.text', 'Home')
    cy.get('[href="/form"] > .clear-bg-btn').should('have.text', 'New Project')
    cy.get('[href="/saved"] > .clear-bg-btn').should('have.text', 'Saved Projects')
    cy.get('[href="/form"] > .clear-bg-btn').click()
    cy.url().should("include", "/form")
    cy.get('.clear-bg-btn > img').click()
    cy.get('[href="/saved"] > .clear-bg-btn').click()
    cy.url().should("include", "/saved")
    cy.get('.clear-bg-btn > img').click()
    cy.get('[href="/"] > .clear-bg-btn').click()
    cy.url().should("include", "/")
  })
})