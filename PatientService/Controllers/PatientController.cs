using Microsoft.AspNetCore.Mvc;
using PatientService.Services;
using PatientService.Models;
using System.Text.Json;

namespace PatientService.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class PatientController : Controller
    {
        PatientServicee PatientServicee = new PatientServicee();

        //POST: http://<patient>
        [HttpPost]
        public ActionResult Post([FromBody] Patient patientObject)
        {
            

            if (patientObject == null)
            {
                return BadRequest();
            }
            else
            {
                return Ok(new
                {
                    StatusCode = 200,
                    Message = "Patient data refreshed successfuly",
                    Response = PatientServicee.CalculatePatient(patientObject)
                });
            }
        }
    }
}