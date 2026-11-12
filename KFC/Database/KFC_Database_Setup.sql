/* =============================================================================
 * KHUHRA FRUIT COMPANY - COMPLETE DATABASE SETUP
 *
 * One script. Creates the database, its tables, every stored procedure, and
 * loads the catalogue data (categories and products).
 *
 * HOW TO RUN IT
 * -------------
 * Easiest - open this file in SQL Server Management Studio and press Execute.
 *
 * Or from a terminal, from the folder this file is in:
 *     sqlcmd -S localhost\SQLEXPRESS -E -i KFC_Database_Setup.sql -f 65001
 *
 * The -f 65001 matters: it tells sqlcmd the file is UTF-8. Without it the
 * Sindhi names load as question marks.
 *
 * If your SQL Server has a different instance name, replace
 * localhost\SQLEXPRESS with yours (for a default install it is just "localhost"
 * or ".").
 *
 * SAFE TO RUN TWICE
 * -----------------
 * Tables are only created when missing, procedures are replaced, and the data
 * section clears the two catalogue tables before loading. So re-running resets the data
 * back to this snapshot - which also means any changes you made since this file
 * was generated will be overwritten.
 *
 * NOTE ON THE ADMIN ACCOUNTS
 * --------------------------
 * This script ships NO admin account and never touches the Admins rows.
 * On a fresh database, create the first admin once through the API:
 * POST /api/auth/register (easiest from Swagger at /swagger) with an email,
 * display name and password. That endpoint works only while no admin exists
 * and closes itself as soon as the first one is created - do it straight away.
 * ========================================================================== */
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

/* =============================================================================
 * Khuhra Fruit Company - stored procedures
 *
 *     sqlcmd -S localhost\SQLEXPRESS -E -i Database\02_StoredProcedures.sql
 *
 * Every procedure here is written to be re-runnable (CREATE OR ALTER), so you
 * can edit this file and run it again without dropping anything.
 *
 * Why stored procedures rather than SQL in C#? It is the pattern this solution
 * already uses (DapperWrapper only ever calls procedures), it keeps query text
 * out of the application, and it means a query can be fixed without rebuilding
 * and redeploying the API.
 * ========================================================================== */

USE KFC;
GO

/* ============================ ADMINS ==================================== */

CREATE OR ALTER PROCEDURE dbo.usp_Admin_Count
AS
BEGIN
    SET NOCOUNT ON;
    SELECT COUNT(*) FROM dbo.Admins;
END
GO

CREATE OR ALTER PROCEDURE dbo.usp_Admin_GetByEmail
    @Email NVARCHAR(200)
AS
BEGIN
    SET NOCOUNT ON;
    SELECT Id, Email, PasswordHash, DisplayName, CreatedAt, LastLoginAt
    FROM dbo.Admins
    WHERE Email = @Email;
END
GO

CREATE OR ALTER PROCEDURE dbo.usp_Admin_Insert
    @Email        NVARCHAR(200),
    @PasswordHash NVARCHAR(400),
    @DisplayName  NVARCHAR(120)
AS
BEGIN
    SET NOCOUNT ON;
    INSERT INTO dbo.Admins (Email, PasswordHash, DisplayName)
    VALUES (@Email, @PasswordHash, @DisplayName);

    SELECT CAST(SCOPE_IDENTITY() AS INT);
END
GO

CREATE OR ALTER PROCEDURE dbo.usp_Admin_TouchLogin
    @Id INT
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE dbo.Admins SET LastLoginAt = SYSUTCDATETIME() WHERE Id = @Id;
END
GO

/* ========================== CATEGORIES ================================== */

CREATE OR ALTER PROCEDURE dbo.usp_Category_GetList
    @Kind VARCHAR(20) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SELECT  c.Id,
            c.Kind,
            c.Slug,
            c.NameEn,
            c.NameSd,
            c.SortOrder,
            ProductCount = (SELECT COUNT(*) FROM dbo.Products p
                            WHERE p.CategoryId = c.Id AND p.IsActive = 1)
    FROM dbo.Categories c
    WHERE (@Kind IS NULL OR c.Kind = @Kind)
    ORDER BY c.Kind, c.SortOrder;
END
GO

/* =========================== PRODUCTS =================================== */

/* What the public website sees: active items only. */
CREATE OR ALTER PROCEDURE dbo.usp_Product_GetList
    @Kind VARCHAR(20) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SELECT  p.Id,
            p.Kind,
            p.Slug,
            c.Slug AS CategorySlug,
            p.NameEn,
            p.NameSd,
            p.LocalName,
            p.DescriptionEn,
            p.DescriptionSd,
            p.ImageUrl,
            p.SeasonMonths,
            p.BasePrice,
            p.PackType,
            p.IsActive,
            p.SortOrder
    FROM dbo.Products p
    INNER JOIN dbo.Categories c ON c.Id = p.CategoryId
    WHERE p.IsActive = 1
      AND (@Kind IS NULL OR p.Kind = @Kind)
    ORDER BY p.SortOrder, p.NameEn;
END
GO

/* What the admin sees: everything, including items that are switched off. */
CREATE OR ALTER PROCEDURE dbo.usp_Product_GetAll
AS
BEGIN
    SET NOCOUNT ON;

    SELECT  p.Id,
            p.Kind,
            p.Slug,
            p.CategoryId,
            c.Slug AS CategorySlug,
            p.NameEn,
            p.NameSd,
            p.LocalName,
            p.DescriptionEn,
            p.DescriptionSd,
            p.ImageUrl,
            p.SeasonMonths,
            p.BasePrice,
            p.PackType,
            p.IsActive,
            p.SortOrder,
            p.UpdatedAt
    FROM dbo.Products p
    INNER JOIN dbo.Categories c ON c.Id = p.CategoryId
    ORDER BY p.Kind, p.SortOrder, p.NameEn;
END
GO

CREATE OR ALTER PROCEDURE dbo.usp_Product_GetById
    @Id INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT  p.Id, p.Kind, p.Slug, p.CategoryId, c.Slug AS CategorySlug,
            p.NameEn, p.NameSd, p.LocalName, p.DescriptionEn, p.DescriptionSd,
            p.ImageUrl, p.SeasonMonths, p.BasePrice, p.PackType, p.IsActive,
            p.SortOrder, p.UpdatedAt
    FROM dbo.Products p
    INNER JOIN dbo.Categories c ON c.Id = p.CategoryId
    WHERE p.Id = @Id;
END
GO

CREATE OR ALTER PROCEDURE dbo.usp_Product_Insert
    @CategoryId    INT,
    @Kind          VARCHAR(20),
    @Slug          VARCHAR(80),
    @NameEn        NVARCHAR(120),
    @NameSd        NVARCHAR(120),
    @LocalName     NVARCHAR(120)  = NULL,
    @DescriptionEn NVARCHAR(600)  = NULL,
    @DescriptionSd NVARCHAR(600)  = NULL,
    @ImageUrl      NVARCHAR(600)  = NULL,
    @SeasonMonths  VARCHAR(40)    = NULL,
    @BasePrice     DECIMAL(12,2)  = NULL,
    @PackType      VARCHAR(10)    = 'kg',
    @IsActive      BIT            = 1,
    @SortOrder     INT            = 50
AS
BEGIN
    SET NOCOUNT ON;

    INSERT INTO dbo.Products
        (CategoryId, Kind, Slug, NameEn, NameSd, LocalName, DescriptionEn, DescriptionSd,
         ImageUrl, SeasonMonths, BasePrice, PackType, IsActive, SortOrder)
    VALUES
        (@CategoryId, @Kind, @Slug, @NameEn, @NameSd, @LocalName, @DescriptionEn, @DescriptionSd,
         @ImageUrl, @SeasonMonths, @BasePrice, @PackType, @IsActive, @SortOrder);

    SELECT CAST(SCOPE_IDENTITY() AS INT);
END
GO

CREATE OR ALTER PROCEDURE dbo.usp_Product_Update
    @Id            INT,
    @CategoryId    INT,
    @Kind          VARCHAR(20),
    @NameEn        NVARCHAR(120),
    @NameSd        NVARCHAR(120),
    @LocalName     NVARCHAR(120)  = NULL,
    @DescriptionEn NVARCHAR(600)  = NULL,
    @DescriptionSd NVARCHAR(600)  = NULL,
    @ImageUrl      NVARCHAR(600)  = NULL,
    @SeasonMonths  VARCHAR(40)    = NULL,
    @BasePrice     DECIMAL(12,2)  = NULL,
    @PackType      VARCHAR(10)    = 'kg',
    @IsActive      BIT            = 1,
    @SortOrder     INT            = 50
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE dbo.Products
    SET CategoryId    = @CategoryId,
        Kind          = @Kind,
        NameEn        = @NameEn,
        NameSd        = @NameSd,
        LocalName     = @LocalName,
        DescriptionEn = @DescriptionEn,
        DescriptionSd = @DescriptionSd,
        ImageUrl      = @ImageUrl,
        SeasonMonths  = @SeasonMonths,
        BasePrice     = @BasePrice,
        PackType      = @PackType,
        IsActive      = @IsActive,
        SortOrder     = @SortOrder,
        UpdatedAt     = SYSUTCDATETIME()
    WHERE Id = @Id;

    SELECT @@ROWCOUNT;
END
GO

/* The quick one: change only the price, which is the common daily job. */
CREATE OR ALTER PROCEDURE dbo.usp_Product_UpdatePrice
    @Id        INT,
    @BasePrice DECIMAL(12,2) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE dbo.Products
    SET BasePrice = @BasePrice,
        UpdatedAt = SYSUTCDATETIME()
    WHERE Id = @Id;

    SELECT @@ROWCOUNT;
END
GO

/* Switch an item off rather than deleting it, so nothing is lost by accident. */
CREATE OR ALTER PROCEDURE dbo.usp_Product_SetActive
    @Id       INT,
    @IsActive BIT
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE dbo.Products
    SET IsActive  = @IsActive,
        UpdatedAt = SYSUTCDATETIME()
    WHERE Id = @Id;

    SELECT @@ROWCOUNT;
END
GO

PRINT 'Stored procedures ready.';
GO

/* ============================================================================
   Admin users

   Adds the ability for a signed-in admin to create more admin accounts, and to
   switch one off again.

   Idempotent, like the other scripts here: safe to run more than once.
   ========================================================================= */

USE KFC;
GO

/* ----------------------------------------------------------------------------
   IsActive

   Turning an account off rather than deleting the row keeps who-did-what honest:
   the account stays, so CreatedAt and LastLoginAt survive, and the person can be
   let back in without being set up from scratch. It also means a mis-tap cannot
   destroy an account.
   ------------------------------------------------------------------------- */
IF NOT EXISTS (SELECT 1 FROM sys.columns
               WHERE object_id = OBJECT_ID('dbo.Admins') AND name = 'IsActive')
BEGIN
    ALTER TABLE dbo.Admins
        ADD IsActive BIT NOT NULL CONSTRAINT DF_Admins_IsActive DEFAULT 1;
END
GO

/* ----------------------------------------------------------------------------
   Reads
   ------------------------------------------------------------------------- */

-- Used by sign-in. Returns IsActive so a switched-off account can be refused.
CREATE OR ALTER PROCEDURE dbo.usp_Admin_GetByEmail
    @Email NVARCHAR(200)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT Id, Email, PasswordHash, DisplayName, CreatedAt, LastLoginAt, IsActive
    FROM dbo.Admins
    WHERE Email = @Email;
END
GO

-- The user list. PasswordHash is deliberately NOT selected: nothing outside
-- sign-in has any reason to read it, and it must never reach the browser.
CREATE OR ALTER PROCEDURE dbo.usp_Admin_GetList
AS
BEGIN
    SET NOCOUNT ON;

    SELECT Id, Email, DisplayName, CreatedAt, LastLoginAt, IsActive
    FROM dbo.Admins
    ORDER BY IsActive DESC, DisplayName;
END
GO

CREATE OR ALTER PROCEDURE dbo.usp_Admin_GetById
    @Id INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT Id, Email, DisplayName, CreatedAt, LastLoginAt, IsActive
    FROM dbo.Admins
    WHERE Id = @Id;
END
GO

-- How many accounts can still sign in. Used to refuse switching off the last one,
-- which would lock everybody out of the admin screens for good.
CREATE OR ALTER PROCEDURE dbo.usp_Admin_CountActive
AS
BEGIN
    SET NOCOUNT ON;

    SELECT COUNT(*) FROM dbo.Admins WHERE IsActive = 1;
END
GO

/* ----------------------------------------------------------------------------
   Writes
   ------------------------------------------------------------------------- */

CREATE OR ALTER PROCEDURE dbo.usp_Admin_SetActive
    @Id       INT,
    @IsActive BIT
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE dbo.Admins
    SET IsActive = @IsActive
    WHERE Id = @Id;

    SELECT @@ROWCOUNT;
END
GO

-- Changing a password. The caller passes an already-hashed value; a plain
-- password never reaches the database.
CREATE OR ALTER PROCEDURE dbo.usp_Admin_SetPassword
    @Id           INT,
    @PasswordHash NVARCHAR(400)
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE dbo.Admins
    SET PasswordHash = @PasswordHash
    WHERE Id = @Id;

    SELECT @@ROWCOUNT;
END
GO

/* =============================================================================
 * DATA
 *
 * Cleared and reloaded as a set. Products are deleted before Categories because
 * a product points at a category - removing a category still in use would be
 * refused by the foreign key.
 *
 * IDENTITY_INSERT is switched on so the original Ids are kept. That matters:
 * Products.CategoryId refers to Categories.Id, so if the categories were
 * renumbered on load, every product would end up in the wrong group.
 * ========================================================================== */

USE KFC;
GO

DELETE FROM dbo.Products;
DELETE FROM dbo.Categories;
GO
/* ---- Categories ---- */
SET IDENTITY_INSERT dbo.Categories ON;
INSERT INTO dbo.Categories (Id, Kind, Slug, NameEn, NameSd, SortOrder) VALUES (1, N'fruit', N'summer-fruit', N'Summer Fruit', N'اونهاري جا ميوا', 1);
INSERT INTO dbo.Categories (Id, Kind, Slug, NameEn, NameSd, SortOrder) VALUES (2, N'fruit', N'orchard-fruit', N'Orchard Fruit', N'باغ جا ميوا', 2);
INSERT INTO dbo.Categories (Id, Kind, Slug, NameEn, NameSd, SortOrder) VALUES (3, N'fruit', N'stone-fruit', N'Stone Fruit', N'ڪڻي وارا ميوا', 3);
INSERT INTO dbo.Categories (Id, Kind, Slug, NameEn, NameSd, SortOrder) VALUES (4, N'fruit', N'citrus', N'Citrus', N'نارنگي قسم', 4);
INSERT INTO dbo.Categories (Id, Kind, Slug, NameEn, NameSd, SortOrder) VALUES (5, N'fruit', N'tropical-dates', N'Tropical & Dates', N'گرم علائقي جا ميوا ۽ کجور', 5);
INSERT INTO dbo.Categories (Id, Kind, Slug, NameEn, NameSd, SortOrder) VALUES (6, N'vegetable', N'everyday-staples', N'Everyday Staples', N'روزاني ضرورت', 1);
INSERT INTO dbo.Categories (Id, Kind, Slug, NameEn, NameSd, SortOrder) VALUES (7, N'vegetable', N'gourds-cucurbits', N'Gourds', N'ڪدو قسم', 2);
INSERT INTO dbo.Categories (Id, Kind, Slug, NameEn, NameSd, SortOrder) VALUES (8, N'vegetable', N'leafy-greens', N'Leafy Greens', N'پَنَ واريون ڀاڄيون', 3);
INSERT INTO dbo.Categories (Id, Kind, Slug, NameEn, NameSd, SortOrder) VALUES (9, N'vegetable', N'pods-beans', N'Pods & Beans', N'ڦريون', 4);
INSERT INTO dbo.Categories (Id, Kind, Slug, NameEn, NameSd, SortOrder) VALUES (10, N'vegetable', N'roots-others', N'Roots & Others', N'پاڙ واريون ۽ ٻيون', 5);
SET IDENTITY_INSERT dbo.Categories OFF;
GO

/* ---- Products ---- */
SET IDENTITY_INSERT dbo.Products ON;
INSERT INTO dbo.Products (Id, CategoryId, Kind, Slug, NameEn, NameSd, LocalName, DescriptionEn, DescriptionSd, ImageUrl, SeasonMonths, BasePrice, PackType, IsActive, SortOrder, CreatedAt, UpdatedAt) VALUES (1, 1, N'fruit', N'mango', N'Mangoes', N'انبو', N'Ambo', N'The headline summer fruit of the Sindh mandi, traded by the crate across the Sindhri, Sindhri Late and Chaunsa varieties.', N'اونهاري جو خاص ميوو، منڊي ۾ پيتين ۾ وڪامندو آهي.', N'https://upload.wikimedia.org/wikipedia/commons/thumb/7/74/Mangos_-_single_and_halved.jpg/960px-Mangos_-_single_and_halved.jpg', N'5,6,7,8', 180.00, N'kg', 1, 1, '2026-10-14T13:38:18', '2026-10-14T13:38:18');
INSERT INTO dbo.Products (Id, CategoryId, Kind, Slug, NameEn, NameSd, LocalName, DescriptionEn, DescriptionSd, ImageUrl, SeasonMonths, BasePrice, PackType, IsActive, SortOrder, CreatedAt, UpdatedAt) VALUES (2, 1, N'fruit', N'watermelon', N'Watermelon', N'هنداڻو', N'Tarbooz', N'Large summer melon sold by the piece and by the load, at its heaviest volume through the hot months.', N'اونهاري جو وڏو ميوو، داڻي ۽ لوڊ تي وڪامندو آهي.', N'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/Watermelon_Bahar1.jpg/960px-Watermelon_Bahar1.jpg', N'4,5,6,7,8', 350.00, N'piece', 1, 2, '2026-10-14T13:38:18', '2026-10-14T13:38:18');
INSERT INTO dbo.Products (Id, CategoryId, Kind, Slug, NameEn, NameSd, LocalName, DescriptionEn, DescriptionSd, ImageUrl, SeasonMonths, BasePrice, PackType, IsActive, SortOrder, CreatedAt, UpdatedAt) VALUES (3, 1, N'fruit', N'melon', N'Melon', N'ڦوٽ', N'Kharbooza', N'Sweet netted summer melon, graded by size and sugar before it moves to retail.', N'مٺو اونهاري جو ميوو، ماپ موجب درجي بندي ٿيندي آهي.', N'https://upload.wikimedia.org/wikipedia/commons/a/ae/Meloen_vrucht_met_bloem.jpg', N'4,5,6,7', 120.00, N'kg', 1, 3, '2026-10-14T13:38:18', '2026-10-14T13:38:18');
INSERT INTO dbo.Products (Id, CategoryId, Kind, Slug, NameEn, NameSd, LocalName, DescriptionEn, DescriptionSd, ImageUrl, SeasonMonths, BasePrice, PackType, IsActive, SortOrder, CreatedAt, UpdatedAt) VALUES (4, 1, N'fruit', N'falsa', N'Falsa', N'فالسو', N'Falsa', N'Small tart purple berry with a short, sharp season, moved quickly because it does not keep.', N'ننڍو کٽو ميوو، موسم ننڍي هوندي آهي.', N'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Phalsa03_Asit.jpg/960px-Phalsa03_Asit.jpg', N'5,6,7', 300.00, N'kg', 1, 4, '2026-10-14T13:38:18', '2026-10-14T13:38:18');
INSERT INTO dbo.Products (Id, CategoryId, Kind, Slug, NameEn, NameSd, LocalName, DescriptionEn, DescriptionSd, ImageUrl, SeasonMonths, BasePrice, PackType, IsActive, SortOrder, CreatedAt, UpdatedAt) VALUES (5, 1, N'fruit', N'jamun', N'Jamun', N'جامڻ', N'Jaman', N'Deep purple monsoon fruit with a single stone, handled in shallow crates to avoid bruising.', N'ڳاڙهي واڱڻائي رنگ جو ميوو، احتياط سان کنيو ويندو آهي.', N'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/Ripe_jamun_fruits.jpg/960px-Ripe_jamun_fruits.jpg', N'6,7,8', 260.00, N'kg', 1, 5, '2026-10-14T13:38:18', '2026-10-14T13:38:18');
INSERT INTO dbo.Products (Id, CategoryId, Kind, Slug, NameEn, NameSd, LocalName, DescriptionEn, DescriptionSd, ImageUrl, SeasonMonths, BasePrice, PackType, IsActive, SortOrder, CreatedAt, UpdatedAt) VALUES (6, 2, N'fruit', N'apple', N'Apples', N'صوف', N'Saib', N'Firm orchard fruit traded in tray-packed cartons and graded by size and colour.', N'سخت ميوو، ڪارٽن ۾ درجي بندي سان وڪامندو آهي.', N'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/Pink_lady_and_cross_section.jpg/960px-Pink_lady_and_cross_section.jpg', N'8,9,10,11,12,1', 220.00, N'kg', 1, 6, '2026-10-14T13:38:18', '2026-10-14T13:38:18');
INSERT INTO dbo.Products (Id, CategoryId, Kind, Slug, NameEn, NameSd, LocalName, DescriptionEn, DescriptionSd, ImageUrl, SeasonMonths, BasePrice, PackType, IsActive, SortOrder, CreatedAt, UpdatedAt) VALUES (7, 2, N'fruit', N'pear', N'Pears', N'ناشپاتي', N'Nashpati', N'Crisp autumn orchard fruit, packed in trays because it marks easily.', N'سرءُ جو ميوو، ٽري ۾ بند ٿيندو آهي.', N'https://upload.wikimedia.org/wikipedia/commons/c/cf/Pears.jpg', N'7,8,9,10', 240.00, N'kg', 1, 7, '2026-10-14T13:38:18', '2026-10-14T13:38:18');
INSERT INTO dbo.Products (Id, CategoryId, Kind, Slug, NameEn, NameSd, LocalName, DescriptionEn, DescriptionSd, ImageUrl, SeasonMonths, BasePrice, PackType, IsActive, SortOrder, CreatedAt, UpdatedAt) VALUES (8, 2, N'fruit', N'pomegranate', N'Pomegranates', N'ڏاڙهون', N'Anar', N'Hard-skinned autumn fruit graded by size and skin colour, sold by the carton.', N'سخت کَل وارو ميوو، ماپ ۽ رنگ موجب درجي بندي.', N'https://upload.wikimedia.org/wikipedia/commons/thumb/6/60/Punica_granatum_fruit_Grenade.jpg/960px-Punica_granatum_fruit_Grenade.jpg', N'9,10,11,12', 360.00, N'kg', 1, 8, '2026-10-14T13:38:18', '2026-10-14T13:38:18');
INSERT INTO dbo.Products (Id, CategoryId, Kind, Slug, NameEn, NameSd, LocalName, DescriptionEn, DescriptionSd, ImageUrl, SeasonMonths, BasePrice, PackType, IsActive, SortOrder, CreatedAt, UpdatedAt) VALUES (9, 2, N'fruit', N'grapes', N'Grapes', N'انگور', N'Angoor', N'Bunched table fruit handled in shallow crates and sold on bunch condition.', N'ڇڳن ۾ ايندو ميوو، ننڍين پيتين ۾ رکيو ويندو آهي.', N'https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Grapes%2C_Rostov-on-Don%2C_Russia.jpg/960px-Grapes%2C_Rostov-on-Don%2C_Russia.jpg', N'6,7,8,9', 320.00, N'kg', 1, 9, '2026-10-14T13:38:18', '2026-10-15T08:08:44');
INSERT INTO dbo.Products (Id, CategoryId, Kind, Slug, NameEn, NameSd, LocalName, DescriptionEn, DescriptionSd, ImageUrl, SeasonMonths, BasePrice, PackType, IsActive, SortOrder, CreatedAt, UpdatedAt) VALUES (10, 3, N'fruit', N'peach', N'Peaches', N'آڙو', N'Aaroo', N'Soft summer stone fruit, tray-packed and moved fast because it ripens in transit.', N'نرم ميوو، جلدي پچي ويندو آهي.', N'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Autumn_Red_peaches.jpg/960px-Autumn_Red_peaches.jpg', N'5,6,7,8', 260.00, N'kg', 1, 10, '2026-10-14T13:38:18', '2026-10-14T13:38:18');
INSERT INTO dbo.Products (Id, CategoryId, Kind, Slug, NameEn, NameSd, LocalName, DescriptionEn, DescriptionSd, ImageUrl, SeasonMonths, BasePrice, PackType, IsActive, SortOrder, CreatedAt, UpdatedAt) VALUES (11, 3, N'fruit', N'plum', N'Plums', N'آلوبخارو', N'Aalu Bukhara', N'Small stone fruit with a short season, graded on colour and firmness.', N'ننڍو ڪڻي وارو ميوو، موسم ننڍي.', N'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/Plums_African_Rose_-_whole%2C_halved_and_slice.jpg/960px-Plums_African_Rose_-_whole%2C_halved_and_slice.jpg', N'5,6,7', 300.00, N'kg', 1, 11, '2026-10-14T13:38:18', '2026-10-14T13:38:18');
INSERT INTO dbo.Products (Id, CategoryId, Kind, Slug, NameEn, NameSd, LocalName, DescriptionEn, DescriptionSd, ImageUrl, SeasonMonths, BasePrice, PackType, IsActive, SortOrder, CreatedAt, UpdatedAt) VALUES (12, 3, N'fruit', N'apricot', N'Apricots', N'خوباني', N'Khubani', N'Delicate summer stone fruit with a very short shelf life, sold fresh and dried.', N'نازڪ ميوو، تازو ۽ سڪل ٻئي وڪامن ٿا.', N'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Apricot_and_cross_section.jpg/960px-Apricot_and_cross_section.jpg', N'6,7,8', 340.00, N'kg', 1, 12, '2026-10-14T13:38:18', '2026-10-14T13:38:18');
INSERT INTO dbo.Products (Id, CategoryId, Kind, Slug, NameEn, NameSd, LocalName, DescriptionEn, DescriptionSd, ImageUrl, SeasonMonths, BasePrice, PackType, IsActive, SortOrder, CreatedAt, UpdatedAt) VALUES (13, 3, N'fruit', N'cherry', N'Cherries', N'چيري', N'Cherry', N'Short-season stone fruit handled in small boxes; a seasonal arrival only.', N'ٿوري موسم وارو ميوو، ننڍن دٻن ۾.', N'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f6/Cherry_season_%2848216568227%29.jpg/960px-Cherry_season_%2848216568227%29.jpg', N'5,6,7', 900.00, N'kg', 1, 13, '2026-10-14T13:38:18', '2026-10-14T13:38:18');
INSERT INTO dbo.Products (Id, CategoryId, Kind, Slug, NameEn, NameSd, LocalName, DescriptionEn, DescriptionSd, ImageUrl, SeasonMonths, BasePrice, PackType, IsActive, SortOrder, CreatedAt, UpdatedAt) VALUES (14, 4, N'fruit', N'orange', N'Oranges', N'نارنگي', N'Kinnow', N'Winter citrus traded by the carton and counted in hundreds as well as by weight.', N'سياري جو ميوو، ڪارٽن ۾ وڪامندو آهي.', N'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/Oranges_-_whole-halved-segment.jpg/960px-Oranges_-_whole-halved-segment.jpg', N'12,1,2,3', 140.00, N'kg', 1, 14, '2026-10-14T13:38:18', '2026-10-14T13:38:18');
INSERT INTO dbo.Products (Id, CategoryId, Kind, Slug, NameEn, NameSd, LocalName, DescriptionEn, DescriptionSd, ImageUrl, SeasonMonths, BasePrice, PackType, IsActive, SortOrder, CreatedAt, UpdatedAt) VALUES (15, 4, N'fruit', N'sweet-lime', N'Sweet Lime', N'موسمبي', N'Mosambi', N'Mild winter citrus, mostly moved for juicing.', N'سياري جو مٺو ميوو، گھڻو ڪري رس لاءِ.', N'https://upload.wikimedia.org/wikipedia/commons/d/d6/Citrus_limetta.jpeg', N'11,12,1,2,3', 120.00, N'kg', 1, 15, '2026-10-14T13:38:18', '2026-10-14T13:38:18');
INSERT INTO dbo.Products (Id, CategoryId, Kind, Slug, NameEn, NameSd, LocalName, DescriptionEn, DescriptionSd, ImageUrl, SeasonMonths, BasePrice, PackType, IsActive, SortOrder, CreatedAt, UpdatedAt) VALUES (16, 5, N'fruit', N'banana', N'Bananas', N'ڪيلو', N'Kela', N'Year-round fruit traded by the dozen and by the hand, ripened in stages.', N'سڄو سال ملندو، درجن جي حساب سان.', N'https://upload.wikimedia.org/wikipedia/commons/d/de/Bananavarieties.jpg', NULL, 150.00, N'dozen', 1, 16, '2026-10-14T13:38:18', '2026-10-14T13:38:18');
INSERT INTO dbo.Products (Id, CategoryId, Kind, Slug, NameEn, NameSd, LocalName, DescriptionEn, DescriptionSd, ImageUrl, SeasonMonths, BasePrice, PackType, IsActive, SortOrder, CreatedAt, UpdatedAt) VALUES (17, 5, N'fruit', N'guava', N'Guavas', N'ڳدرو', N'Amrood', N'Aromatic winter fruit, graded by size and sold in baskets and crates.', N'سياري جو خوشبودار ميوو، ٽوڪرين ۾ ايندو آهي.', N'https://upload.wikimedia.org/wikipedia/commons/thumb/8/88/Guava_pink_fruit.jpg/960px-Guava_pink_fruit.jpg', N'8,9,10,11,12,1,2', 150.00, N'kg', 1, 0, '2026-10-14T13:38:18', '2026-10-15T08:25:30');
INSERT INTO dbo.Products (Id, CategoryId, Kind, Slug, NameEn, NameSd, LocalName, DescriptionEn, DescriptionSd, ImageUrl, SeasonMonths, BasePrice, PackType, IsActive, SortOrder, CreatedAt, UpdatedAt) VALUES (18, 5, N'fruit', N'papaya', N'Papaya', N'پپيتو', N'Papita', N'Large soft tropical fruit available through most of the year, sold by weight.', N'نرم ميوو، گھڻو سال ملندو، وزن تي.', N'https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/Papaya_iftar_sell.JPG/960px-Papaya_iftar_sell.JPG', NULL, 130.00, N'kg', 1, 18, '2026-10-14T13:38:18', '2026-10-14T13:38:18');
INSERT INTO dbo.Products (Id, CategoryId, Kind, Slug, NameEn, NameSd, LocalName, DescriptionEn, DescriptionSd, ImageUrl, SeasonMonths, BasePrice, PackType, IsActive, SortOrder, CreatedAt, UpdatedAt) VALUES (19, 5, N'fruit', N'chikoo', N'Chikoo', N'چيڪو', N'Chikoo', N'Small brown-skinned sweet fruit, handled gently and sold ripe.', N'ننڍو مٺو ميوو، احتياط سان کنيو ويندو آهي.', N'https://upload.wikimedia.org/wikipedia/commons/thumb/0/00/%E0%B4%B8%E0%B4%AA%E0%B5%8D%E0%B4%AA%E0%B5%8B%E0%B4%9F%E0%B5%8D%E0%B4%9F.jpg/960px-%E0%B4%B8%E0%B4%AA%E0%B5%8D%E0%B4%AA%E0%B5%8B%E0%B4%9F%E0%B5%8D%E0%B4%9F.jpg', N'2,3,4,5,6', 200.00, N'kg', 1, 19, '2026-10-14T13:38:18', '2026-10-14T13:38:18');
INSERT INTO dbo.Products (Id, CategoryId, Kind, Slug, NameEn, NameSd, LocalName, DescriptionEn, DescriptionSd, ImageUrl, SeasonMonths, BasePrice, PackType, IsActive, SortOrder, CreatedAt, UpdatedAt) VALUES (20, 5, N'fruit', N'dates', N'Dates / Khajoor', N'کجور', N'Khajoor', N'Traded fresh at harvest and dried thereafter; Sindh is a major date-growing region.', N'تازي ۽ سڪل ٻئي صورتن ۾، سنڌ جي خاص پيداوار.', N'https://upload.wikimedia.org/wikipedia/commons/thumb/4/45/Dates005.jpg/960px-Dates005.jpg', N'7,8,9', 450.00, N'small', 1, 20, '2026-10-14T13:38:18', '2026-10-14T13:38:18');
INSERT INTO dbo.Products (Id, CategoryId, Kind, Slug, NameEn, NameSd, LocalName, DescriptionEn, DescriptionSd, ImageUrl, SeasonMonths, BasePrice, PackType, IsActive, SortOrder, CreatedAt, UpdatedAt) VALUES (21, 1, N'fruit', N'other-seasonal-fruit', N'Other Seasonal Fruits', N'ٻيا موسمي ميوا', NULL, N'Whatever else is arriving in the mandi this week. Message us and we will tell you what is on the floor today.', N'هن هفتي منڊي ۾ ايندڙ ٻيا ميوا. اسان کان پڇو.', N'https://upload.wikimedia.org/wikipedia/commons/thumb/9/97/Gourock_greengrocers_ext.jpg/960px-Gourock_greengrocers_ext.jpg', NULL, NULL, N'none', 1, 99, '2026-10-14T13:38:18', '2026-10-14T13:38:18');
INSERT INTO dbo.Products (Id, CategoryId, Kind, Slug, NameEn, NameSd, LocalName, DescriptionEn, DescriptionSd, ImageUrl, SeasonMonths, BasePrice, PackType, IsActive, SortOrder, CreatedAt, UpdatedAt) VALUES (22, 6, N'vegetable', N'potato', N'Potatoes', N'پٽاٽا', N'Aloo', N'Stored and traded all year in jute bags, graded by size and skin condition.', N'سڄو سال ملندا، ڳوڻين ۾ وڪامندا آهن.', N'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ab/Patates.jpg/960px-Patates.jpg', NULL, 60.00, N'kg', 1, 1, '2026-10-14T13:38:18', '2026-10-14T13:38:18');
INSERT INTO dbo.Products (Id, CategoryId, Kind, Slug, NameEn, NameSd, LocalName, DescriptionEn, DescriptionSd, ImageUrl, SeasonMonths, BasePrice, PackType, IsActive, SortOrder, CreatedAt, UpdatedAt) VALUES (23, 6, N'vegetable', N'onion', N'Onions', N'بصر', N'Piyaz', N'A core mandi staple sold in bags year round, with price moving sharply on arrivals.', N'منڊي جي بنيادي شيءِ، سڄو سال ڳوڻين ۾.', N'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Mixed_onions.jpg/960px-Mixed_onions.jpg', NULL, 80.00, N'kg', 1, 2, '2026-10-14T13:38:18', '2026-10-14T13:38:18');
INSERT INTO dbo.Products (Id, CategoryId, Kind, Slug, NameEn, NameSd, LocalName, DescriptionEn, DescriptionSd, ImageUrl, SeasonMonths, BasePrice, PackType, IsActive, SortOrder, CreatedAt, UpdatedAt) VALUES (24, 6, N'vegetable', N'tomato', N'Tomatoes', N'ٽماٽا', N'Tamatar', N'Traded year round in shallow crates; the most price-sensitive line on the floor.', N'سڄو سال ملندا، قيمت جلدي بدلجندي آهي.', N'https://upload.wikimedia.org/wikipedia/commons/thumb/8/89/Tomato_je.jpg/960px-Tomato_je.jpg', NULL, 90.00, N'kg', 1, 3, '2026-10-14T13:38:18', '2026-10-14T13:38:18');
INSERT INTO dbo.Products (Id, CategoryId, Kind, Slug, NameEn, NameSd, LocalName, DescriptionEn, DescriptionSd, ImageUrl, SeasonMonths, BasePrice, PackType, IsActive, SortOrder, CreatedAt, UpdatedAt) VALUES (25, 6, N'vegetable', N'green-chilli', N'Green Chillies', N'سائي مرچ', N'Hari Mirch', N'Sold in sacks year round; Sindh is a major chilli-growing province.', N'سڄو سال ڳوڻين ۾، سنڌ جي خاص پيداوار.', N'https://upload.wikimedia.org/wikipedia/commons/thumb/5/50/Madame_Jeanette_and_other_chillies.jpg/960px-Madame_Jeanette_and_other_chillies.jpg', NULL, 160.00, N'small', 1, 4, '2026-10-14T13:38:18', '2026-10-14T13:38:18');
INSERT INTO dbo.Products (Id, CategoryId, Kind, Slug, NameEn, NameSd, LocalName, DescriptionEn, DescriptionSd, ImageUrl, SeasonMonths, BasePrice, PackType, IsActive, SortOrder, CreatedAt, UpdatedAt) VALUES (26, 6, N'vegetable', N'garlic', N'Garlic', N'ٿوم', N'Lehsan', N'Dry bulb line traded year round from stored stock, graded on bulb size.', N'سڄو سال ملندو، ڳنڍ جي ماپ موجب.', N'https://upload.wikimedia.org/wikipedia/commons/thumb/4/49/Opened_garlic_bulb_with_garlic_clove.jpg/960px-Opened_garlic_bulb_with_garlic_clove.jpg', NULL, 400.00, N'small', 1, 5, '2026-10-14T13:38:18', '2026-10-14T13:38:18');
INSERT INTO dbo.Products (Id, CategoryId, Kind, Slug, NameEn, NameSd, LocalName, DescriptionEn, DescriptionSd, ImageUrl, SeasonMonths, BasePrice, PackType, IsActive, SortOrder, CreatedAt, UpdatedAt) VALUES (27, 6, N'vegetable', N'ginger', N'Ginger', N'ادرڪ', N'Adrak', N'Rhizome line sold by weight all year, mostly from stored and imported stock.', N'سڄو سال وزن تي وڪامندو آهي.', N'https://upload.wikimedia.org/wikipedia/commons/thumb/2/22/Ginger_-_%E0%B4%87%E0%B4%9E%E0%B5%8D%E0%B4%9A%E0%B4%BF_10.jpg/960px-Ginger_-_%E0%B4%87%E0%B4%9E%E0%B5%8D%E0%B4%9A%E0%B4%BF_10.jpg', NULL, 420.00, N'small', 1, 6, '2026-10-14T13:38:18', '2026-10-14T13:38:18');
INSERT INTO dbo.Products (Id, CategoryId, Kind, Slug, NameEn, NameSd, LocalName, DescriptionEn, DescriptionSd, ImageUrl, SeasonMonths, BasePrice, PackType, IsActive, SortOrder, CreatedAt, UpdatedAt) VALUES (28, 6, N'vegetable', N'lemon', N'Lemon', N'ليمو', N'Limo', N'Small citrus traded with the vegetable lines, sold by weight year round.', N'ننڍو ميوو، ڀاڄين سان گڏ وڪامندو آهي.', N'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/P1030323.JPG/960px-P1030323.JPG', NULL, 180.00, N'small', 1, 7, '2026-10-14T13:38:18', '2026-10-14T13:38:18');
INSERT INTO dbo.Products (Id, CategoryId, Kind, Slug, NameEn, NameSd, LocalName, DescriptionEn, DescriptionSd, ImageUrl, SeasonMonths, BasePrice, PackType, IsActive, SortOrder, CreatedAt, UpdatedAt) VALUES (29, 7, N'vegetable', N'cucumber', N'Cucumber', N'ڪڪڙي', N'Kheera', N'Summer salad line sold by weight, strongest through the hot months.', N'اونهاري جي ڀاڄي، وزن تي وڪامندي آهي.', N'https://upload.wikimedia.org/wikipedia/commons/thumb/9/96/ARS_cucumber.jpg/960px-ARS_cucumber.jpg', N'3,4,5,6,7,8,9', 70.00, N'kg', 1, 8, '2026-10-14T13:38:18', '2026-10-14T13:38:18');
INSERT INTO dbo.Products (Id, CategoryId, Kind, Slug, NameEn, NameSd, LocalName, DescriptionEn, DescriptionSd, ImageUrl, SeasonMonths, BasePrice, PackType, IsActive, SortOrder, CreatedAt, UpdatedAt) VALUES (30, 7, N'vegetable', N'bitter-gourd', N'Bitter Gourd', N'ڪريلو', N'Karela', N'Ridged summer gourd graded on size and colour, sold by weight.', N'اونهاري جي ڀاڄي، ماپ موجب درجي بندي.', N'https://upload.wikimedia.org/wikipedia/commons/thumb/9/98/Bitter_gourd_at_Hyderabad_market.jpg/960px-Bitter_gourd_at_Hyderabad_market.jpg', N'4,5,6,7,8,9', 120.00, N'kg', 1, 9, '2026-10-14T13:38:18', '2026-10-14T13:38:18');
INSERT INTO dbo.Products (Id, CategoryId, Kind, Slug, NameEn, NameSd, LocalName, DescriptionEn, DescriptionSd, ImageUrl, SeasonMonths, BasePrice, PackType, IsActive, SortOrder, CreatedAt, UpdatedAt) VALUES (31, 7, N'vegetable', N'ridge-gourd', N'Ridge Gourd', N'تورئي', N'Tori', N'Long ridged summer gourd, sold fresh and handled in open crates.', N'ڊگھي اونهاري جي ڀاڄي، کُليل پيتين ۾.', N'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d5/Luffa_acutangula_Chinese_okra.jpg/960px-Luffa_acutangula_Chinese_okra.jpg', N'4,5,6,7,8,9', 90.00, N'kg', 1, 10, '2026-10-14T13:38:18', '2026-10-14T13:38:18');
INSERT INTO dbo.Products (Id, CategoryId, Kind, Slug, NameEn, NameSd, LocalName, DescriptionEn, DescriptionSd, ImageUrl, SeasonMonths, BasePrice, PackType, IsActive, SortOrder, CreatedAt, UpdatedAt) VALUES (32, 7, N'vegetable', N'bottle-gourd', N'Bottle Gourd', N'ڪدو', N'Lauki', N'Large pale gourd sold by weight across most of the warm season.', N'وڏي ڀاڄي، گرم موسم ۾ وزن تي.', N'https://upload.wikimedia.org/wikipedia/commons/a/a2/Courge_encore_verte.jpg', N'3,4,5,6,7,8,9,10', 70.00, N'kg', 1, 11, '2026-10-14T13:38:18', '2026-10-14T13:38:18');
INSERT INTO dbo.Products (Id, CategoryId, Kind, Slug, NameEn, NameSd, LocalName, DescriptionEn, DescriptionSd, ImageUrl, SeasonMonths, BasePrice, PackType, IsActive, SortOrder, CreatedAt, UpdatedAt) VALUES (33, 7, N'vegetable', N'tinda', N'Tinda', N'ٽينڊو', N'Tinda', N'Small round summer gourd, sold by weight and graded small for the best price.', N'ننڍي گول ڀاڄي، ننڍي ماپ جي قيمت وڌيڪ.', N'https://upload.wikimedia.org/wikipedia/commons/8/80/Tinda.jpg', N'4,5,6,7,8', 110.00, N'kg', 1, 12, '2026-10-14T13:38:18', '2026-10-14T13:38:18');
INSERT INTO dbo.Products (Id, CategoryId, Kind, Slug, NameEn, NameSd, LocalName, DescriptionEn, DescriptionSd, ImageUrl, SeasonMonths, BasePrice, PackType, IsActive, SortOrder, CreatedAt, UpdatedAt) VALUES (34, 7, N'vegetable', N'pumpkin', N'Pumpkin', N'حلوا ڪدو', N'Kaddu', N'Heavy keeping gourd sold whole and in cut pieces by weight.', N'ڳري ڀاڄي، سڄي ۽ ڪٽيل ٻئي طرح.', N'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/FrenchMarketPumpkinsB.jpg/960px-FrenchMarketPumpkinsB.jpg', N'5,6,7,8,9,10', 60.00, N'kg', 1, 13, '2026-10-14T13:38:18', '2026-10-14T13:38:18');
INSERT INTO dbo.Products (Id, CategoryId, Kind, Slug, NameEn, NameSd, LocalName, DescriptionEn, DescriptionSd, ImageUrl, SeasonMonths, BasePrice, PackType, IsActive, SortOrder, CreatedAt, UpdatedAt) VALUES (35, 8, N'vegetable', N'spinach', N'Spinach', N'پالڪ', N'Palak', N'Winter leafy line tied in bundles and moved the same day it arrives.', N'سياري جي ڀاڄي، ڳٺڙين ۾، جلدي وڪامندي آهي.', N'https://upload.wikimedia.org/wikipedia/commons/thumb/5/56/Fresh_Spinach_leaves.jpg/960px-Fresh_Spinach_leaves.jpg', N'10,11,12,1,2,3', 50.00, N'kg', 1, 14, '2026-10-14T13:38:18', '2026-10-14T13:38:18');
INSERT INTO dbo.Products (Id, CategoryId, Kind, Slug, NameEn, NameSd, LocalName, DescriptionEn, DescriptionSd, ImageUrl, SeasonMonths, BasePrice, PackType, IsActive, SortOrder, CreatedAt, UpdatedAt) VALUES (36, 8, N'vegetable', N'cabbage', N'Cabbage', N'بند گوبي', N'Band Gobi', N'Dense winter head sold by weight; keeps better than most greens.', N'سياري جي ڀاڄي، وزن تي، گھڻو وقت رهندي آهي.', N'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Cabbage_and_cross_section_on_white.jpg/960px-Cabbage_and_cross_section_on_white.jpg', N'11,12,1,2,3', 60.00, N'kg', 1, 15, '2026-10-14T13:38:18', '2026-10-14T13:38:18');
INSERT INTO dbo.Products (Id, CategoryId, Kind, Slug, NameEn, NameSd, LocalName, DescriptionEn, DescriptionSd, ImageUrl, SeasonMonths, BasePrice, PackType, IsActive, SortOrder, CreatedAt, UpdatedAt) VALUES (37, 8, N'vegetable', N'cauliflower', N'Cauliflower', N'گل گوبي', N'Phool Gobi', N'Winter head graded on curd whiteness and tightness, sold by weight.', N'سياري جي ڀاڄي، اڇي رنگ تي درجي بندي.', N'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Chou-fleur_02.jpg/960px-Chou-fleur_02.jpg', N'10,11,12,1,2,3', 90.00, N'kg', 1, 16, '2026-10-14T13:38:18', '2026-10-14T13:38:18');
INSERT INTO dbo.Products (Id, CategoryId, Kind, Slug, NameEn, NameSd, LocalName, DescriptionEn, DescriptionSd, ImageUrl, SeasonMonths, BasePrice, PackType, IsActive, SortOrder, CreatedAt, UpdatedAt) VALUES (38, 9, N'vegetable', N'okra', N'Okra / Bhindi', N'ڀينڊي', N'Bhindi', N'Tender summer pod picked young; graded small and sold by weight.', N'اونهاري جي نرم ڦري، ننڍي چُني ويندي آهي.', N'https://upload.wikimedia.org/wikipedia/commons/thumb/9/95/Hong_Kong_Okra_Aug_25_2012.JPG/960px-Hong_Kong_Okra_Aug_25_2012.JPG', N'3,4,5,6,7,8,9', 140.00, N'kg', 1, 17, '2026-10-14T13:38:18', '2026-10-14T13:38:18');
INSERT INTO dbo.Products (Id, CategoryId, Kind, Slug, NameEn, NameSd, LocalName, DescriptionEn, DescriptionSd, ImageUrl, SeasonMonths, BasePrice, PackType, IsActive, SortOrder, CreatedAt, UpdatedAt) VALUES (39, 9, N'vegetable', N'peas', N'Peas', N'مٽر', N'Matar', N'Winter pod line sold in sacks, priced on pod fill and freshness.', N'سياري جي ڦري، ڳوڻين ۾ وڪامندي آهي.', N'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bc/Doperwt_rijserwt_peulen_Pisum_sativum.jpg/960px-Doperwt_rijserwt_peulen_Pisum_sativum.jpg', N'11,12,1,2', 180.00, N'kg', 1, 18, '2026-10-14T13:38:18', '2026-10-14T13:38:18');
INSERT INTO dbo.Products (Id, CategoryId, Kind, Slug, NameEn, NameSd, LocalName, DescriptionEn, DescriptionSd, ImageUrl, SeasonMonths, BasePrice, PackType, IsActive, SortOrder, CreatedAt, UpdatedAt) VALUES (40, 9, N'vegetable', N'beans', N'Beans', N'ڦري', N'Phali', N'Green pod line of the cooler months, sold by weight and graded on snap.', N'ٿڌي موسم جي سائي ڦري، وزن تي.', N'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/Heaps_of_beans.jpg/960px-Heaps_of_beans.jpg', N'10,11,12,1,2,3', 160.00, N'kg', 1, 19, '2026-10-14T13:38:18', '2026-10-14T13:38:18');
INSERT INTO dbo.Products (Id, CategoryId, Kind, Slug, NameEn, NameSd, LocalName, DescriptionEn, DescriptionSd, ImageUrl, SeasonMonths, BasePrice, PackType, IsActive, SortOrder, CreatedAt, UpdatedAt) VALUES (41, 10, N'vegetable', N'carrot', N'Carrots', N'گاجر', N'Gajar', N'Winter root washed and bunched or bagged, sold by weight.', N'سياري جي پاڙ، ڌوپي ڳوڻين ۾ ايندي آهي.', N'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Vegetable-Carrot-Bundle-wStalks.jpg/960px-Vegetable-Carrot-Bundle-wStalks.jpg', N'11,12,1,2,3', 80.00, N'kg', 1, 20, '2026-10-14T13:38:18', '2026-10-14T13:38:18');
INSERT INTO dbo.Products (Id, CategoryId, Kind, Slug, NameEn, NameSd, LocalName, DescriptionEn, DescriptionSd, ImageUrl, SeasonMonths, BasePrice, PackType, IsActive, SortOrder, CreatedAt, UpdatedAt) VALUES (42, 10, N'vegetable', N'eggplant', N'Eggplant / Baingan', N'واڱڻ', N'Baingan', N'Traded year round in round and long shapes, graded on skin gloss.', N'سڄو سال ملندي، گول ۽ ڊگھي ٻنهي شڪلين ۾.', N'https://upload.wikimedia.org/wikipedia/commons/thumb/7/76/Solanum_melongena_24_08_2012_%281%29.JPG/960px-Solanum_melongena_24_08_2012_%281%29.JPG', NULL, 70.00, N'kg', 1, 21, '2026-10-14T13:38:18', '2026-10-14T13:38:18');
INSERT INTO dbo.Products (Id, CategoryId, Kind, Slug, NameEn, NameSd, LocalName, DescriptionEn, DescriptionSd, ImageUrl, SeasonMonths, BasePrice, PackType, IsActive, SortOrder, CreatedAt, UpdatedAt) VALUES (43, 10, N'vegetable', N'other-seasonal-vegetables', N'Other Seasonal Vegetables', N'ٻيون موسمي ڀاڄيون', NULL, N'Coriander, mint, turnip, radish and whatever else the season brings. Message us for what is on the floor today.', N'ڌاڻا، پودينو، گوگڙو ۽ ٻيون موسمي ڀاڄيون. اسان کان پڇو.', N'https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Marketvegetables.jpg/960px-Marketvegetables.jpg', NULL, NULL, N'none', 1, 99, '2026-10-14T13:38:18', '2026-10-14T13:38:18');
SET IDENTITY_INSERT dbo.Products OFF;
GO

/* =============================================================================
 * VERIFY - what you should see
 * ========================================================================== */
SELECT
    (SELECT COUNT(*) FROM dbo.Categories) AS categories,
    (SELECT COUNT(*) FROM dbo.Products)   AS products,
    (SELECT COUNT(*) FROM dbo.Products WHERE IsActive = 1)      AS showing_on_shop,
    (SELECT COUNT(*) FROM dbo.Products WHERE BasePrice IS NULL) AS no_price_yet,
    (SELECT COUNT(*) FROM dbo.Admins)     AS admin_accounts;
GO

/* Sindhi check. first_codepoint should be a number above 1500 (Arabic script).
   If it comes back as 63 - the code for "?" - the file was loaded without
   UTF-8: re-run with  -f 65001,  or execute it from SSMS instead. */
SELECT TOP 3 Slug, NameSd, UNICODE(LEFT(NameSd, 1)) AS first_codepoint
FROM dbo.Products
ORDER BY SortOrder;
GO