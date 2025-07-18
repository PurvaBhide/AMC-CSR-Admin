var Api = {};

if (typeof CategoryService !== 'undefined') {
  Api.category = CategoryService;
}

if (typeof ProjectService !== 'undefined') {
  Api.project = ProjectService;
}
if (typeof NgoService !== 'undefined') {
  Api.ngo = NgoService;
}
if (typeof ParticipantService !== 'undefined') {
  Api.participant = ParticipantService;
}
if(typeof galleryServices!== 'undefined'){
  Api.gallery = galleryServices;
}
if(typeof SuccessStoryService!== 'undefined'){
  Api.successStory = SuccessStoryService;
}
if(typeof newsService!== 'undefined'){
  Api.news = newsService;
}
if(typeof DocumentService!== 'undefined'){
  Api.document = DocumentService;
}
if(typeof CompanyService!== 'undefined'){
  Api.company = CompanyService;
}
if(typeof fundanideaSrevices!== 'undefined'){
  Api.fundanidea = fundanideaSrevices;
}