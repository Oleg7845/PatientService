using Microsoft.AspNetCore.Mvc;
using PatientService.Services;
using PatientService.Models;

namespace PatientService.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class DepartamentsListController : Controller
    {
        [HttpGet]
        public IActionResult GetDepartaments()
        {
            PatientServicee PatientServicee = new PatientServicee();

            return Ok(new DepartamentsList()
            {
                Departaments = PatientServicee.GetDepartaments()
            });
        }
    }
}
