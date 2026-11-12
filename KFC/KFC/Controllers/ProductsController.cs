using BuisnessLogic.Services;
using BuisnessObject.Catalogue;
using BuisnessObject.General;
using Microsoft.AspNetCore.Mvc;

namespace KFC.Controllers
{
    /// <summary>
    /// The public catalogue the shop reads. No sign-in needed, and only active items are returned.
    /// </summary>
    [Route("api/[controller]")]
    [ApiController]
    [Produces("application/json")]
    public class ProductsController : ControllerBase
    {
        #region PropertiesAndConstructors

        private readonly BL_Catalogue _blCatalogue;

        public ProductsController(BL_Catalogue blCatalogue)
        {
            _blCatalogue = blCatalogue;
        }

        #endregion PropertiesAndConstructors

        /// <summary>Lists products on sale.</summary>
        /// <param name="category">"fruit" or "vegetable". Omit for everything.</param>
        [HttpGet]
        [ProducesResponseType(typeof(BOL_ApiResponse<List<BOL_Product>>), StatusCodes.Status200OK)]
        public async Task<ActionResult<BOL_ApiResponse<List<BOL_Product>>>> Get([FromQuery] string? category)
        {
            var products = await _blCatalogue.GetProductsAsync(category);

            return Ok(BOL_ApiResponse<List<BOL_Product>>.Ok(products));
        }
    }
}
