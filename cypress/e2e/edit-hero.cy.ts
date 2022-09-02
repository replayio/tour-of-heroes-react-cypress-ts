import {faker} from '@faker-js/faker'
import {Hero} from '../../src/models/Hero'

describe('Edit hero', () => {
  before(cy.resetData)
  after(cy.resetData)

  const verifyHero = (heroes: Hero[], heroIndex: number) => {
    expect(heroes.length).to.be.greaterThan(0)

    cy.getByCy('edit-button').eq(heroIndex).click()
    cy.location('pathname').should('include', '/heroes/edit-hero/')
    cy.getByCy('hero-detail').should('be.visible')
    cy.getByCy('input-detail-id').should('be.visible')
    cy.findByDisplayValue(heroes[heroIndex].id)
    cy.findByDisplayValue(heroes[heroIndex].name)
    cy.findByDisplayValue(heroes[heroIndex].description)
  }

  it('should go through the cancel edit flow (ui-integration)', () => {
    cy.intercept('GET', `${Cypress.env('API_URL')}/heroes`, {
      fixture: 'heroes',
    }).as('stubbedGetHeroes')
    cy.visit('/')
    cy.wait('@stubbedGetHeroes')
    cy.location('pathname').should('eq', '/heroes')

    cy.fixture('heroes').then(heroes => verifyHero(heroes, 0))

    cy.getByCy('cancel-button').click()
    cy.location('pathname').should('eq', '/heroes')
    cy.getByCy('hero-list').should('be.visible')
  })

  it('should go through the edit flow (ui-e2e)', () => {
    cy.intercept('GET', `${Cypress.env('API_URL')}/heroes`).as('getHeroes')
    cy.visit('/')
    cy.wait('@getHeroes')

    cy.crud('GET', 'heroes')
      .its('body')
      .then(heroes => {
        verifyHero(heroes, Cypress._.random(0, heroes.length - 1))

        const editedHero = {
          name: faker.internet.userName(),
          description: `description ${faker.internet.userName()}`,
        }

        cy.getByCy('input-detail-name')
          .find('.input')
          .clear()
          .type(`${editedHero.name}`)
        cy.getByCy('input-detail-description')
          .find('.input')
          .clear()
          .type(`${editedHero.description}`)
        cy.getByCy('save-button').click()

        cy.getByCy('hero-list')
          .should('be.visible')
          .should('contain', editedHero.name)
          .and('contain', editedHero.description)
      })
  })
})