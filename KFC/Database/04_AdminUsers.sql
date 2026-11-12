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
