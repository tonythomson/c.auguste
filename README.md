#C.Auguste API Documentation

##Overview

***(Please note that C.Auguste is a WIP; consider it alpha-quality)***

The C.Auguste API provides a RESTful interface to the company and filing information stored in the [SEC's EDGAR database](http://www.sec.gov/edgar/searchedgar/companysearch.html).

Data is updated daily, by downloading the previous day's index of all filings, and then parsing it and scraping the EDGAR website to obtain all data associated with each filing and company.

C.Auguste uses HTTP verbs for all CRUD operations on the database, and strives for RESTful best practices. Feedback is welcome.


###Base URL:

    http://cauguste.herokuapp.com/

__Note that data on the public-facing server listed above is limited to a subset of one day's data__

###Company Data Resource URLs:

Method | URL | Action
------------ | ------------- | ------------
`GET` | `/v0/companies`  | Retrieve all companies
`GET` | `/v0/companies/1000275` | Retrieve the company with the specified CIK
*`POST`* | *`/v0/companies`* | *Add a new company*
*`PUT`* | *`/v0/companies/{CIK}`* | *Update the company with the specified CIK*
*`DELETE`* | *`/v0/companies/{CIK}`* | *Delete the company with the specified CIK*

*Note that `POST`, `PUT` and `DELETE` operations are __ADMIN-ONLY__, and are not publicly exposed.*

####List all companies:
    GET http://api.cauguste.com/v0/companies

Example Response:

```
{
  "object": "list",
  "url": "v0/companies",
  "count": 3,
  "data": [
    {
      "cik": "1000001",
      "name": "COMPANY NAME",
      "irs_num": "00-0000000",
      "incorp_st": "CA",
      "fy_end": 1231,
      "bus_addr1": "A FANCY PLAZA",
      "bus_addr2": "101 SOME STREET",
      "bus_addr3": "SAN FRANCISCO CA 94102",
    "bus_addr4": null,
      "bus_phone": "4155551234",
      "mail_addr1": "A FANCY PLAZA",
      "mail_addr2": "101 SOME STREET",
      "mail_addr3": "SAN FRANCISCO CA 94102 ",
      "sic": 6029
    },
    {...},
    {...}
  ]
}
```

####Filing Data Resource URLs:

Method | URL | Action
------------ | ------------- | ------------
`GET` | `/v0/filings`  | Retrieve all filings
`GET` | `/v0/filings/0000904454-13-000393` | Retrieve the filing with the specified accession number

####List all filings:
    GET http://api.cauguste.com/v0/filings

Example Response:

```
{
  "object": "list",
  "url": "v1/filings",
  "count": 3,
  "data": [
    {
      "acc_num": "0001155555-55-555555",
      "descr": "Form N-30D - Annual and semi-annual reports mailed to shareholders",
      "form_type": "N-30D",
      "form_type": "5",
      "file_date": "2013-03-07",
      "file_date_ch": "2013-03-07",
      "acc_date": "2013-03-07 09:17:37",
      "rep_period": "",
      "eff_date": "",
      "num_docs": 1,
      "documents": [
        {
          {
            "seq": 0,
            "descr": "Complete submission text file",
            "f_name": "0000743415-13-000004.txt",
            "f_type": " ",
            "f_size": 3481
          },
          {
            "seq": 1,
            "f_descr": "MUTUAL OF AMERICA SEPARATE ACCOUNT 3; N-30D",
            "f_type": "N-30D",
            "f_size": 2147
          }
        }
      ],
      "group_members": "",
      "items": "",
      "issuer": "1055555",
      "reporter": "1066666",
    },
    {...},
    {...}
  ]
}
```

##Contributors

'Development' is the currently active branch. Pull requests are welcome.

### Getting Started
####Setup:
To run C.Auguste, you'll need to have the following installed:

* Node.js
* PostgreSQL

You can run C.Auguste directly from a git checkout:

    git clone git@github.com:tonythomson/c.auguste.git
    cd c.auguste

Required Node modules can be installed by typing `npm install`. Dependencies are defined in the 'package.json' file.

Create a Postgres database called 'cauguste'. Assuming you have Postgres installed, you can do this by running psql, and typing the following at the prompt:

    CREATE DATABASE cauguste

Quit psql (`\q`), and type the following to set up the tables for C.Auguste:

    psql cauguste -f data/create_db.sql 

####Running the Scraper:
A sample index file is located in data/ directory. You can now run the scraper by typing the following:

    node scapeIdx.js data/test.idx

The scraper will iterate through the index file, fetch data associated with each filing and company from the SEC website, and insert that data into the database.

####Running the API Server:
Launch the API server by typing the following:

    node server.js

Unless you have made changes, the server will run on port 3000 of your local machine. Loading [`http://127.0.0.1:3000/`](http://127.0.0.1:3000/) should return a simple 'hello world' message (for now).

The data resource URLs will be available as specified above.

####Running the Test Suite:
Tests are implemented using [node-jasmine](mhevery/jasmine-node · GitHub), which should have installed with the `npm install` command. To run the tests, type the following from the root of the `c.auguste` directory:

    jasmine-node specs/companies.spec
    // => Runs tests for the companies resource URLs
    jasmine-node specs/filings.spec
    // => Runs tests for the filings resource URLs

##Data Breakdown
So what does the scraper actually do?

Every day, the SEC summarizes the previous day's filings in a series of index files, and makes the files available on an anonymous FTP server at [`ftp://ftp.sec.gov`](ftp://ftp.sec.gov).

C.Auguste's script works with the master index files, available in `/edgar/dailyindex/`. The script ignores the first few lines of metadata in the file and parses the individual lines, each of which represents a filing from the day to which the index refers. The scraper notes the SEC accession number, and then requests the webpage for that filing from the SEC EDGAR website. Info for any documents associated with the filing are stored in C.Auguste's `filings` table.

The script then parses all available metadata for the filing from the web page, and writes the data to the `filings` table in C.Auguste's database. The script also checks the company (referred to by a Central Index Key, or CIK), and, if the company is not in C.Auguste's `companies` table, requests the relevant company page from the SEC EDGAR website, and parses the relevant company metadata for insertion into the `companies` table.
.