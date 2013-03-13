#C.Auguste API Documentation

##Overview

***(Please note that C.Auguste is a WIP; consider it alpha-quality)***

The C.Auguste API provides a RESTful interface to the company and filing information stored in the [SEC's EDGAR database](http://www.sec.gov/edgar/searchedgar/companysearch.html).

Data is updated daily, by downloading the previous day's index of all filings, and then parsing it and scraping the EDGAR website to obtain all data associated with each filing and company.

C.Auguste uses HTTP verbs for all CRUD operations on the database, and strives for RESTful best practices. Feedback is welcome.


###Base URL:

`http://api.cauguste.com/`

###Resource URL Patterns:

####Company Data (implemented):

Method | URL | Action
------------ | ------------- | ------------
`GET` | `/v0/companies`  | Retrieve all companies
`GET` | `/v0/companies/1000275` | Retrieve the company with the specified CIK
`POST` | `/v0/companies` | Add a new company
`PUT` | `/v0/companies/{CIK}` | Update the company with the specified CIK
`DELETE` | `/v0/companies/{CIK}` | Delete the company with the specified CIK

####Filing Data (not yet implemented):

Method | URL | Action
------------ | ------------- | ------------
`GET` | `/v0/filings`  | Retrieve all companies
`GET` | `/v0/filings/1000275` | Retrieve the company with the specified CIK
`POST` | `/v0/filings` | Add a new company
`PUT` | `/v0/filings/{SEC Accession #}` | Update the company with the specified CIK
`DELETE` | `/v0/filings/{SEC Accession #}` | Delete the company with the specified CIK

##Technical Information
C.Auguste was built using Node, Express and PostgreSQL.