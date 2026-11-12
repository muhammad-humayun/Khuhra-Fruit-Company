/* =============================================================================
 * Khuhra Fruit Company - database schema
 *
 * Run this once to create the database and its tables:
 *     sqlcmd -S localhost\SQLEXPRESS -E -i Database\01_Schema.sql
 *
 * Safe to run again: every object is created only if it is missing, so running
 * it twice will not destroy data.
 * ========================================================================== */

IF DB_ID('KFC') IS NULL
BEGIN
    CREATE DATABASE KFC;
END
GO

USE KFC;
GO

/* ---------------------------------------------------------------------------
 * Admins - who may sign in to the admin screens.
 *
 * Note PasswordHash, not Password. A password is never stored in a form that
 * anyone (including you) can read back. We store the result of a one-way hash,
 * so a stolen database still does not hand over anyone's password.
 * ------------------------------------------------------------------------ */
IF OBJECT_ID('dbo.Admins', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.Admins
    (
        Id            INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_Admins PRIMARY KEY,
        Email         NVARCHAR(200)     NOT NULL,
        PasswordHash  NVARCHAR(400)     NOT NULL,
        DisplayName   NVARCHAR(120)     NOT NULL,
        CreatedAt     DATETIME2(0)      NOT NULL CONSTRAINT DF_Admins_CreatedAt DEFAULT SYSUTCDATETIME(),
        LastLoginAt   DATETIME2(0)      NULL,
        CONSTRAINT UQ_Admins_Email UNIQUE (Email)
    );
END
GO

/* ---------------------------------------------------------------------------
 * Categories - the groupings shown on the Fruits and Vegetables pages.
 * ------------------------------------------------------------------------ */
IF OBJECT_ID('dbo.Categories', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.Categories
    (
        Id         INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_Categories PRIMARY KEY,
        Kind       VARCHAR(20)       NOT NULL,
        Slug       VARCHAR(60)       NOT NULL,
        NameEn     NVARCHAR(100)     NOT NULL,
        NameSd     NVARCHAR(100)     NOT NULL,
        SortOrder  INT               NOT NULL CONSTRAINT DF_Categories_SortOrder DEFAULT 0,
        CONSTRAINT UQ_Categories_Slug UNIQUE (Slug),
        CONSTRAINT CK_Categories_Kind CHECK (Kind IN ('fruit', 'vegetable'))
    );
END
GO

/* ---------------------------------------------------------------------------
 * Products - everything the shop sells.
 *
 * BasePrice is the single number an admin edits. The pack sizes shown to the
 * customer (1 kg / 5 kg / 40 kg, or 250 g / 500 g / 1 kg, or dozens, or pieces)
 * are worked out from it in code, so the admin screen stays one box per item
 * instead of three.
 *
 * BasePrice NULL means "price on request" - the card shows a WhatsApp button
 * instead of a number. That is deliberate, not missing data.
 * ------------------------------------------------------------------------ */
IF OBJECT_ID('dbo.Products', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.Products
    (
        Id             INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_Products PRIMARY KEY,
        CategoryId     INT               NOT NULL CONSTRAINT FK_Products_Categories REFERENCES dbo.Categories(Id),
        Kind           VARCHAR(20)       NOT NULL,
        Slug           VARCHAR(80)       NOT NULL,
        NameEn         NVARCHAR(120)     NOT NULL,
        NameSd         NVARCHAR(120)     NOT NULL,
        LocalName      NVARCHAR(120)     NULL,
        DescriptionEn  NVARCHAR(600)     NULL,
        DescriptionSd  NVARCHAR(600)     NULL,
        ImageUrl       NVARCHAR(600)     NULL,
        /* Comma separated month numbers, e.g. '5,6,7,8'. Empty means year round. */
        SeasonMonths   VARCHAR(40)       NULL,
        /* Decimal, never float. Money in a float silently loses pennies. */
        BasePrice      DECIMAL(12,2)     NULL,
        PackType       VARCHAR(10)       NOT NULL CONSTRAINT DF_Products_PackType DEFAULT 'kg',
        /* Soft delete: hiding an item keeps its history instead of erasing it. */
        IsActive       BIT               NOT NULL CONSTRAINT DF_Products_IsActive DEFAULT 1,
        SortOrder      INT               NOT NULL CONSTRAINT DF_Products_SortOrder DEFAULT 0,
        CreatedAt      DATETIME2(0)      NOT NULL CONSTRAINT DF_Products_CreatedAt DEFAULT SYSUTCDATETIME(),
        UpdatedAt      DATETIME2(0)      NOT NULL CONSTRAINT DF_Products_UpdatedAt DEFAULT SYSUTCDATETIME(),
        CONSTRAINT UQ_Products_Slug UNIQUE (Slug),
        CONSTRAINT CK_Products_Kind CHECK (Kind IN ('fruit', 'vegetable')),
        CONSTRAINT CK_Products_PackType CHECK (PackType IN ('kg', 'small', 'dozen', 'piece', 'none')),
        CONSTRAINT CK_Products_BasePrice CHECK (BasePrice IS NULL OR BasePrice > 0)
    );

    CREATE INDEX IX_Products_Kind_Active ON dbo.Products (Kind, IsActive) INCLUDE (SortOrder);
END
GO

PRINT 'Schema ready.';
GO
