CREATE DATABASE cauguste;

\c cauguste;

CREATE TABLE companies (
	cik           varchar(10) NOT NULL PRIMARY KEY,	-- SEC central index key
	name 				  varchar(130),
	irs_num       int,						-- IRS number
	incorp_st     varchar(2),			-- state of incorporation
	fy_end        smallint,				-- fiscal year end
	bus_addr1     varchar(30),
	bus_addr2     varchar(30),
	bus_addr3     varchar(30),
	bus_phone     varchar(30),
	mail_addr1    varchar(30),
	mail_addr2    varchar(30),
	mail_addr3    varchar(30),
	sic           int 						-- standard industrial classification
);

CREATE TABLE filings (
	acc_num       varchar(20) NOT NULL,	-- SEC accession number
	descr         varchar(80),		-- description
  form_type     varchar(20),
	file_date     date,
	file_date_ch  date,						-- filing date changed
	acc_date      timestamp,			-- accepted
	rep_period    date,						-- period of report
	issuer        int,						-- issuing company (CIK)
	reporter      int, 						-- reporting company (CIK)
  PRIMARY KEY(acc_num, issuer)
);

CREATE TABLE documents (
	id            bigint NOT NULL PRIMARY KEY,	-- unique id (no EDGAR equiv)
	seq           smallint,				-- ?
	descr         varchar(80),
	file_name     varchar(80),
	type          smallint,				-- ?
	size          int,						-- file size
	acc_num       varchar(20)			-- SEC accession number
);

INSERT INTO companies (cik, name, irs_num, incorp_st, fy_end, bus_addr1, bus_addr2, bus_addr3, mail_addr1, mail_addr2, mail_addr3, sic) 
VALUES (
  '0001004980',
  'PG&E Corp',
  943234914,
  'CA',
  1231,
  '77 BEALE STREET',
  'P.O. BOX 770000',
  'SAN FRANCISCO CA 94177',
  '77 BEALE STREET',
  'P.O. BOX 770000',
  'SAN FRANCISCO CA 94177',
  4931
);