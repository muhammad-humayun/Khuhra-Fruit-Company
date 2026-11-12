using BuisnessLogic.Services;
using BuisnessObject.Catalogue;
using BuisnessObject.General;
using Microsoft.AspNetCore.Mvc;

namespace KFC.Controllers
{
    /// <summary>Catalogue groupings used by the shop filters and the admin form.</summary>
    [Route("api/[controller]")]
    [ApiController]
    [Produces("application/json")]
    public class CategoriesController : ControllerBase
    {
        #region PropertiesAndConstructors

        private readonly BL_Catalogue _blCatalogue;

        public CategoriesController(BL_Catalogue blCatalogue)
        {
            _blCatalogue = blCatalogue;
        }

        #endregion PropertiesAndConstructors

        /// <param name="category">"fruit" or "vegetable". Omit for both.</param>
        [HttpGet]
        [ProducesResponseType(typeof(BOL_ApiResponse<List<BOL_Category>>), StatusCodes.Status200OK)]
        public async Task<ActionResult<BOL_ApiResponse<List<BOL_Category>>>> Get([FromQuery] string? category)
        {
            var categories = await _blCatalogue.GetCategoriesAsync(category);

            return Ok(BOL_ApiResponse<List<BOL_Category>>.Ok(categories));
        }
    }
}
