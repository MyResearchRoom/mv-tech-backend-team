exports.validateQueryParams = (query = {}) => {
  let { searchTerm, page, limit, sortBy, sortOrder } = query;

  if (searchTerm === "undefined" || searchTerm === "null") {
    searchTerm = "";
  }

  if (sortBy === "undefined" || sortBy === "null") {
    sortBy = undefined;
  }

  if (sortOrder === "undefined" || sortOrder === "null") {
    sortOrder = undefined;
  }

  if (page === "undefined" || page === "null") {
    page = undefined;
  }

  if (limit === "undefined" || limit === "null") {
    limit = undefined;
  }

  searchTerm =
    typeof searchTerm === "string" ? searchTerm.trim() : "";

  sortBy = typeof sortBy === "string" ? sortBy : "createdAt";
  sortOrder =
    typeof sortOrder === "string"
      ? sortOrder.toLowerCase()
      : "desc";

  if (!["asc", "desc"].includes(sortOrder)) {
    sortOrder = "desc";
  }


  page = parseInt(page, 10);

  if (isNaN(page) || page < 1) {
    page = 1;
  }


  const isAll = typeof limit === "string" &&
    limit.trim().toLowerCase() === "all";

  if (isAll) {
    return {
      searchTerm,
      page: 1,
      limit: null,
      offset: 0,
      sortBy,
      sortOrder,
      isAll: true,
    };
  }

  limit = parseInt(limit, 10);

  if (isNaN(limit) || limit < 1 || limit > 100) {
    limit = 10;
  }

  return {
    searchTerm,
    page,
    limit,
    offset: (page - 1) * limit,
    sortBy,
    sortOrder,
    isAll: false,
  };
};