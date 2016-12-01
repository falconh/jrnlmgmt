DROP TABLE IF EXISTS jrnlmgmt.JRNLPRGSS_TBL;
DROP TABLE IF EXISTS jrnlmgmt.JRNLPLN_TBL;
DROP TABLE IF EXISTS jrnlmgmt.JRNL_TBL;
DROP TABLE IF EXISTS jrnlmgmt.FLMD_TBL;
DROP TABLE IF EXISTS jrnlmgmt.SPRVISE_TBL;
DROP TABLE IF EXISTS jrnlmgmt.STUDNT_TBL;
DROP TABLE IF EXISTS jrnlmgmt.USR_TBL;

CREATE TABLE jrnlmgmt.USR_TBL(
	USR_ID INT NOT NULL AUTO_INCREMENT,
	USR_USRNM VARCHAR(255) NOT NULL,
	USR_PASSWD VARCHAR(255) NOT NULL,
	USR_NM VARCHAR(255) NOT NULL,
	USR_DEPTMNT VARCHAR(255) NOT NULL,
	USR_ROLE INT NOT NULL DEFAULT 0,
	CONSTRAINT PK_USR_ID PRIMARY KEY(USR_ID),
	CONSTRAINT UK_USERNAME UNIQUE (USR_USRNM)
);

CREATE TABLE jrnlmgmt.STUDNT_TBL(
	STUDNT_ID INT NOT NULL,
	STUDNT_NM VARCHAR(255) NOT NULL,
	STUDNT_TYP VARCHAR(255) NOT NULL,
	CONSTRAINT PK_STUDNT_ID PRIMARY KEY(STUDNT_ID)
);

CREATE TABLE jrnlmgmt.SPRVISE_TBL(
	SPRVISE_ID INT NOT NULL AUTO_INCREMENT,
	SPRVISE_USR_ID INT NOT NULL,
	SPRVISE_STDNT_ID INT NOT NULL,
	CONSTRAINT PK_SPRVISE_ID PRIMARY KEY(SPRVISE_ID),
	CONSTRAINT UK_SPRVISE_USR_STDNTJRNLPLN_TBLJRNLPLN_TBL UNIQUE (SPRVISE_USR_ID,SPRVISE_STDNT_ID),
	CONSTRAINT FK_USR_ID FOREIGN KEY (SPRVISE_USR_ID) REFERENCES USR_TBL(USR_ID),
	CONSTRAINT FK_STDNT_ID FOREIGN KEY (SPRVISE_STDNT_ID) REFERENCES STUDNT_TBL(STUDNT_ID)
);

CREATE TABLE jrnlmgmt.JRNLPLN_TBL(
	JRNLPLN_ID INT NOT NULL AUTO_INCREMENT,
	JRNLPLN_SPRVISE_ID INT NOT NULL,
	JRNLPLN_DATE DATE NOT NULL,
	JRNLPLN_NO_JRNL INT NOT NULL,
	CONSTRAINT PK_JRNLPLN_ID PRIMARY KEY(JRNLPLN_ID),
	CONSTRAINT UK_JRNLPLN_SPRVISEID_DATE UNIQUE (JRNLPLN_SPRVISE_ID,JRNLPLN_DATE),
	CONSTRAINT FK_SPRVISE_ID FOREIGN KEY (JRNLPLN_SPRVISE_ID) REFERENCES SPRVISE_TBL(SPRVISE_ID)
);

CREATE TABLE jrnlmgmt.JRNL_TBL(
	JRNL_ID INT NOT NULL AUTO_INCREMENT,
	JRNL_NM VARCHAR(255) NOT NULL,
	JRNL_PPR_NM VARCHAR(255) NOT NULL,
	JRNL_ATHRS VARCHAR(255) NOT NULL,
    JRNL_QRTL_RANK VARCHAR(255) NOT NULL,
    JRNL_IMPCT_FCTOR DECIMAL(10,4) NOT NULL,
	CONSTRAINT PK_JRNL_ID PRIMARY KEY (JRNL_ID),
	CONSTRAINT UK_JRNL_NM_PPRNM_ATHRS UNIQUE (JRNL_NM, JRNL_PPR_NM, JRNL_ATHRS)
);

CREATE TABLE jrnlmgmt.FLMD_TBL(
	FLMD_ID INT NOT NULL AUTO_INCREMENT,
    FLMD_LOC VARCHAR(255) NOT NULL,
    FLMD_ORIGINALNM VARCHAR(255) NOT NULL,
    CONSTRAINT PK_FLMD_ID PRIMARY KEY (FLMD_ID)
);

CREATE TABLE jrnlmgmt.JRNLPRGSS_TBL(
	JRNLPRGSS_ID INT NOT NULL AUTO_INCREMENT,
	JRNLPRGSS_JRNLPLN_ID INT NOT NULL,
	JRNLPRGSS_JRNL_ID INT NOT NULL,
	JRNLPRGSS_CREATED_DATE DATE NOT NULL,
	JRNLPRGSS_STATUS VARCHAR(20) NOT NULL,
    JRNLPRGSS_DSCRP VARCHAR(255),
	JRNLPRGSS_PRF INT,
	CONSTRAINT PK_JRNLPRGSS_ID PRIMARY KEY(JRNLPRGSS_ID),
	CONSTRAINT FK_JRNLPLN_ID FOREIGN KEY (JRNLPRGSS_JRNLPLN_ID) REFERENCES JRNLPLN_TBL(JRNLPLN_ID),
	CONSTRAINT FK_JRNL_ID FOREIGN KEY (JRNLPRGSS_JRNL_ID) REFERENCES JRNL_TBL(JRNL_ID),
    CONSTRAINT FK_JRNLPRGSS_PRF FOREIGN KEY (JRNLPRGSS_PRF) REFERENCES FLMD_TBL(FLMD_ID)
);

INSERT INTO jrnlmgmt.USR_TBL(USR_USRNM, USR_PASSWD, USR_NM, USR_DEPTMNT, USR_ROLE) VALUES('test@test.com','1234', 'testuser','testdept','1');