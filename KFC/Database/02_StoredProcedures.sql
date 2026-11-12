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
