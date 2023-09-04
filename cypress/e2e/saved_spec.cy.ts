describe('saved projects spec', () => {

  it('should display all saved projects and allow users to view them and unsave', () => {
    cy.stubSingleFetch('users/1/projects', "savedProjects", 200)
    cy.visit('http://localhost:3000/saved')
      .get('.saved-project').should('have.length', 2)
    cy.intercept('PATCH',`https://ai-project-planner-be-72e73912044c.herokuapp.com/api/v1/users/1/projects/1`, {
        statusCode: 200, 
        fixture: `unSaved1`
    }).as(`unSaved1`) 
      cy.get('.saved-project-title').first().contains('Makeup 360')
        .get('.saved-project-description').first().contains('Browse the most stunning makeup...')
        .get('.saved-mini-palette').first().children().should('have.length', 6)
        .get(`[href="/saved/1"] > .saved-project`).click()
        .url().should('eq', `http://localhost:3000/saved/1`)
      cy.stubSingleFetch('/users/1/projects', 'unSavedProj1', 200)
      cy.get('button').contains('Unfavorite Plan')
  })
  
  it('should display a helpful message when there are no saved projects', () => {
    cy.stubSingleFetch('users/1/projects', "unSavedProjects", 200)
    cy.visit('http://localhost:3000/saved')
    cy.get('.saved-project').should('have.length', 0) 
      .get('p').contains('No favorite projects yet! Generate a project and save it to view it here!')
      .get('a[href="/form"]').contains('Generate a new plan').click()
      .url().should('eq', 'http://localhost:3000/form')
  })
})
