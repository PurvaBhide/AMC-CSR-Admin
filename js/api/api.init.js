var Api = {};

if (typeof CategoryService !== 'undefined') {
  Api.category = CategoryService;
}

if (typeof ProjectService !== 'undefined') {
  Api.project = ProjectService;
}
