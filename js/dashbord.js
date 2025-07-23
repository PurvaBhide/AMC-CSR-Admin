document.addEventListener("DOMContentLoaded", function () {
  async function updateDashboard() {
    try {
      const [projects, participants, ngos, companies,resources, categories, fundIdeas, successStories] = await Promise.all([
        Api.project.listAll(),
        Api.participant.listAll(),
        Api.ngo.listAll(),
        Api.company.listAll(),
        Api.document.listAll(),
        Api.category.listAll(),
        Api.fundanidea.listAll(),
        Api.successStory.listAll()
        ]);

      // Corrected to read from `data.content`
      document.getElementById("Projects").innerText = projects?.data?.totalElements|| 0;
      document.getElementById("totalDonations").innerText = participants?.data?.totalElements || 0;
      document.getElementById("ngoApplications").innerText = ngos?.data?.totalElements|| 0;
      document.getElementById("companies").innerText = companies?.data?.totalElements || 0;
 document.getElementById("totalResources").innerText = resources?.data?.totalElements || 0;
    document.getElementById("totalCategories").innerText = categories?.data.length || 0;
    document.getElementById("fundIdeas").innerText = fundIdeas?.data?.totalElements || 0;
    document.getElementById("successStories").innerText = successStories?.data?.totalElements || 0;

    } catch (error) {
      console.error("Error updating dashboard:", error);
    }
  }

  updateDashboard();
});
