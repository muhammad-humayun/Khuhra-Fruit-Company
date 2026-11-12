using System.Net;
using BuisnessLogic.Services;
using BuisnessObject.Catalogue;
using BuisnessObject.General;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace KFC.Controllers
{
    /// <summary>
    /// Item management for the admin screens.
    /// </summary>
    /// <remarks>
    /// [Authorize] on the class is the whole security boundary: ASP.NET checks for a valid,
    /// unexpired, correctly-signed token before any method here runs. Without it every endpoint
    /// below would be open to the internet, and anyone could rewrite your prices.
    ///
    /// Everything here changes what customers see, which is why it is separated from the public
    /// ProductsController rather than being extra methods on it with an if-statement.
    /// </remarks>
    [Route("api/admin/products")]
    [ApiController]
    [Authorize(Roles = "Admin")]
    [Produces("application/json")]
    public class AdminProductsController : ControllerBase
    {
        #region PropertiesAndConstructors

        private readonly BL_Catalogue _blCatalogue;

        public AdminProductsController(BL_Catalogue blCatalogue)
        {
            _blCatalogue = blCatalogue;
        }

        #endregion PropertiesAndConstructors

        /// <summary>Every item, including ones switched off.</summary>
        [HttpGet]
        [ProducesResponseType(typeof(BOL_ApiResponse<List<BOL_ProductAdmin>>), StatusCodes.Status200OK)]
        public async Task<ActionResult<BOL_ApiResponse<List<BOL_ProductAdmin>>>> GetAll()
        {
            var products = await _blCatalogue.GetAllForAdminAsync();

            return Ok(BOL_ApiResponse<List<BOL_ProductAdmin>>.Ok(products));
        }

        [HttpGet("{id:int}")]
        [ProducesResponseType(typeof(BOL_ApiResponse<BOL_ProductAdmin>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(BOL_ApiResponse<BOL_ProductAdmin>), StatusCodes.Status404NotFound)]
        public async Task<ActionResult<BOL_ApiResponse<BOL_ProductAdmin>>> GetOne(int id)
        {
            var product = await _blCatalogue.GetByIdAsync(id);

            return product is null
                ? NotFound(BOL_ApiResponse<BOL_ProductAdmin>.Fail(HttpStatusCode.NotFound, "That item does not exist."))
                : Ok(BOL_ApiResponse<BOL_ProductAdmin>.Ok(product));
        }

        /// <summary>Adds a new item to the shop.</summary>
        [HttpPost]
        [ProducesResponseType(typeof(BOL_ApiResponse<BOL_ProductAdmin>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(BOL_ApiResponse<BOL_ProductAdmin>), StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<BOL_ApiResponse<BOL_ProductAdmin>>> Create([FromBody] BOL_ProductSaveRequest request)
        {
            var outcome = await _blCatalogue.CreateAsync(request);

            if (outcome.Status == SaveStatus.CategoryNotFound)
            {
                return BadRequest(BOL_ApiResponse<BOL_ProductAdmin>.Fail(
                    HttpStatusCode.BadRequest,
                    "Choose a category for this item."));
            }

            if (outcome.Status == SaveStatus.CategoryKindMismatch)
            {
                return BadRequest(BOL_ApiResponse<BOL_ProductAdmin>.Fail(
                    HttpStatusCode.BadRequest,
                    "That category belongs to the other type. Pick a fruit category for a fruit, or a vegetable category for a vegetable."));
            }

            if (outcome.Status == SaveStatus.SlugTaken)
            {
                return BadRequest(BOL_ApiResponse<BOL_ProductAdmin>.Fail(
                    HttpStatusCode.BadRequest,
                    "Another item already uses that web name. Try a different English name or set the slug yourself."));
            }

            var created = await _blCatalogue.GetByIdAsync(outcome.Id);
            return Ok(BOL_ApiResponse<BOL_ProductAdmin>.Ok(created!, "Item added."));
        }

        /// <summary>Edits an existing item.</summary>
        [HttpPut("{id:int}")]
        [ProducesResponseType(typeof(BOL_ApiResponse<BOL_ProductAdmin>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(BOL_ApiResponse<BOL_ProductAdmin>), StatusCodes.Status404NotFound)]
        public async Task<ActionResult<BOL_ApiResponse<BOL_ProductAdmin>>> Update(int id, [FromBody] BOL_ProductSaveRequest request)
        {
            var outcome = await _blCatalogue.UpdateAsync(id, request);

            if (outcome.Status == SaveStatus.CategoryNotFound)
            {
                return BadRequest(BOL_ApiResponse<BOL_ProductAdmin>.Fail(
                    HttpStatusCode.BadRequest,
                    "Choose a category for this item."));
            }

            if (outcome.Status == SaveStatus.CategoryKindMismatch)
            {
                return BadRequest(BOL_ApiResponse<BOL_ProductAdmin>.Fail(
                    HttpStatusCode.BadRequest,
                    "That category belongs to the other type. Pick a fruit category for a fruit, or a vegetable category for a vegetable."));
            }

            if (outcome.Status == SaveStatus.NotFound)
            {
                return NotFound(BOL_ApiResponse<BOL_ProductAdmin>.Fail(HttpStatusCode.NotFound, "That item does not exist."));
            }

            var updated = await _blCatalogue.GetByIdAsync(id);
            return Ok(BOL_ApiResponse<BOL_ProductAdmin>.Ok(updated!, "Item saved."));
        }

        /// <summary>
        /// Changes only the price - the common daily job, kept separate so it is one tap.
        /// </summary>
        [HttpPut("{id:int}/price")]
        [ProducesResponseType(typeof(BOL_ApiResponse<BOL_ProductAdmin>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(BOL_ApiResponse<BOL_ProductAdmin>), StatusCodes.Status404NotFound)]
        public async Task<ActionResult<BOL_ApiResponse<BOL_ProductAdmin>>> UpdatePrice(int id, [FromBody] BOL_PriceUpdateRequest request)
        {
            if (!await _blCatalogue.UpdatePriceAsync(id, request.BasePrice))
            {
                return NotFound(BOL_ApiResponse<BOL_ProductAdmin>.Fail(HttpStatusCode.NotFound, "That item does not exist."));
            }

            var updated = await _blCatalogue.GetByIdAsync(id);
            return Ok(BOL_ApiResponse<BOL_ProductAdmin>.Ok(updated!, "Price updated."));
        }

        /// <summary>
        /// Shows or hides an item in the shop.
        /// </summary>
        /// <remarks>
        /// This is a soft delete. Hiding keeps the row, so nothing is lost by a mis-tap and the
        /// item can come back with its Sindhi name, description and photo intact.
        /// </remarks>
        [HttpPut("{id:int}/active")]
        [ProducesResponseType(typeof(BOL_ApiResponse<BOL_ProductAdmin>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(BOL_ApiResponse<BOL_ProductAdmin>), StatusCodes.Status404NotFound)]
        public async Task<ActionResult<BOL_ApiResponse<BOL_ProductAdmin>>> SetActive(int id, [FromQuery] bool isActive)
        {
            if (!await _blCatalogue.SetActiveAsync(id, isActive))
            {
                return NotFound(BOL_ApiResponse<BOL_ProductAdmin>.Fail(HttpStatusCode.NotFound, "That item does not exist."));
            }

            var updated = await _blCatalogue.GetByIdAsync(id);
            return Ok(BOL_ApiResponse<BOL_ProductAdmin>.Ok(updated!, isActive ? "Item is now visible." : "Item is now hidden."));
        }
    }
}
