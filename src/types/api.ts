export interface ApiContent {
  id: number;
  we_are_ar: string;
  we_are_en: string;
  our_vision_ar: string;
  our_vision_en: string;
  our_message_ar: string;
  our_message_en: string;
  buy_fome_us_ar: string;
  buy_fome_us_en: string;
  our_values_ar: string;
  our_values_en: string;
  address_ar: string;
  address_en: string;
  email: string;
  facebook: string;
  instagram: string;
  toktek: string;
  whatsapp: string;
  location: string;
  create_at: string;
  update_at: string;
}

export interface ApiGoal {
  id: number;
  name_ar: string;
  name_en: string;
  create_at: string;
  update_at: string;
}

export interface ApiSlider {
  id: number;
  name_ar: string;
  name_en: string;
  image_full_size: string;
  image_small_size: string;
  image_content_full_size: string;
  image_content_small_size: string;
  urls: string;
  create_at: string;
  update_at: string;
}

export interface ApiAgent {
  id: number;
  name_ar: string;
  name_en: string;
  image: string;
  urls: string;
  buy_fome_us_ar: string;
  buy_fome_us_en: string;
  service?: Array<{
    id: number;
    agent_name_ar: string;
    agent_name_en: string;
    name_ar: string;
    name_en: string;
    agent: number;
  }>;
  create_at: string;
  update_at: string;
}

export interface ApiPublicService {
  id: number;
  name_ar: string;
  name_en: string;
  create_at: string;
  update_at: string;
}

export interface ApiService {
  id: number;
  agent_name_ar: string;
  agent_name_en: string;
  name_ar: string;
  name_en: string;
  create_at: string;
  update_at: string;
  agent: number;
}

export interface ApiBranch {
  id: number;
  name_ar: string;
  name_en: string;
  images: string;
  address_ar: string;
  address_en: string;
  link_location: string;
  phone: string;
  email: string;
  create_at: string;
  update_at: string;
}

export interface ApiCustomerReview {
  id: number;
  name_ar: string;
  name_en: string;
  image: string;
  review_ar: string;
  review_en: string;
  create_at: string;
  update_at: string;
}

export interface ApiProjectImage {
  id: number;
  image: string;
  created_at: string;
  updated_at: string;
  project: number;
}

export interface ApiProject {
  id: number;
  project_images: ApiProjectImage[];
  agent_name_ar: string;
  agent_name_en: string;
  name_ar: string;
  name_en: string;
  short_description_ar: string;
  short_description_en: string;
  image: string;
  description_ar: string;
  description_en: string;
  location_ar: string;
  location_en: string;
  commit_owner_ar: string;
  commit_owner_en: string;
  name_owner_ar: string;
  name_owner_en: string;
  attribute_ar: string;
  attribute_en: string;
  start: string;
  completed: string;
  video_files: string;
  created_at: string;
  updated_at: string;
  agent: number;
}

export interface ApiProductImage {
  id: number;
  image: string;
  created_at: string;
  updated_at: string;
  product: number;
}

export interface ApiProductUnit {
  id: number;
  name_product_ar: string;
  name_product_en: string;
  number_product: string;
  name_unit_ar: string;
  name_unit_en: string;
  is_active: boolean;
  price: string;
  created_at: string;
  updated_at: string;
  lft: number;
  rght: number;
  tree_id: number;
  level: number;
  product: number;
  parent: number | null;
}

/**
 * A product department ("القسم").
 *
 * Departments are standalone records that own the brand relationship: a product
 * no longer points at an agent directly, it points at a department, and the
 * department carries the agent. `agent_name_ar` / `agent_name_en` are read-only
 * conveniences the API resolves for display.
 *
 * `exmple` keeps the API's spelling (a typo in the backend model) so the field
 * actually reaches it.
 */
export interface ApiDepartment {
  id: number;
  agent: number | null;
  agent_name_ar: string;
  agent_name_en: string;
  name_ar: string;
  name_en: string;
  exmple: string | null;
  crated_at: string;
  updated_at: string;
}

export interface ApiProduct {
  id: number;
  product_images: ApiProductImage[];
  agent_name_ar: string;
  agent_name_en: string;
  name_uint: ApiProductUnit[];
  /**
   * Frontend-only for now: the backend `Product` model has no `number_group`
   * yet, so the value is collected and sent but currently discarded. It starts
   * persisting the moment the field is added to Django.
   */
  number_group?: string;
  number_product: string;
  name_product_ar: string;
  name_product_en: string;
  is_active: boolean;
  description_product_ar: string;
  description_product_en: string;
  image: string;
  crated_at: string;
  updated_at: string;
  /** Owning department. The agent is derived from it. */
  department: number | null;
  department_name_ar?: string;
  department_name_en?: string;
}


export interface ApiData {
  content: ApiContent;
  gool: ApiGoal[];
  slider: ApiSlider[];
  our_agent: ApiAgent[];
  public_service: ApiPublicService[];
  service: ApiService[];
  branch: ApiBranch[];
  customer_review: ApiCustomerReview[];
  project: ApiProject[];
  product: ApiProduct[];
}

export interface ApiResponse {
  success: boolean;
  message: string;
  data: ApiData;
}

/**
 * Shape returned by the DRF `CustomPagination` class on the backend.
 *
 * NOTE: `next` / `previous` are page NUMBERS (not URLs) — the backend overrides
 * `get_next_link()` / `get_previous_link()` to return `int(page_number)`.
 * They are `null` when there is no adjacent page.
 *
 * When the request includes `?pagination=false`, the backend skips
 * `paginate_queryset()` entirely and returns a bare array instead of this
 * envelope. Always normalise with `normalizeListResponse()` instead of
 * reading `data.results` directly.
 */
export interface ApiPaginatedData<T> {
  next: number | null;
  previous: number | null;
  count: number;
  results: T[];
}

export interface ApiProductsResponse {
  success: boolean;
  message: string;
  data: ApiPaginatedData<ApiProduct>;
}

export interface ApiSingleProductResponse {
  success: boolean;
  message: string;
  data: ApiProduct;
}

export interface ApiProjectsResponse {
  success: boolean;
  message: string;
  data: ApiPaginatedData<ApiProject>;
}

export interface ApiSingleProjectResponse {
  success: boolean;
  message: string;
  data: ApiProject;
}

export interface ApiAgentsResponse {
  success: boolean;
  message: string;
  data: ApiPaginatedData<ApiAgent>;
}

export interface ApiDepartmentsResponse {
  success: boolean;
  message: string;
  data: ApiPaginatedData<ApiDepartment>;
}

export interface ApiSingleDepartmentResponse {
  success: boolean;
  message: string;
  data: ApiDepartment;
}

// ==========================================
// HR MODULE TYPES
// ==========================================

export interface ApiJobTitle {
  id: number;
  name: string;
  tesk: string;
  create_at: string;
  update_at: string;
}

export interface ApiJobTitlesResponse {
  success: boolean;
  message: string;
  data: ApiPaginatedData<ApiJobTitle>;
}

export interface ApiSingleJobTitleResponse {
  success: boolean;
  message: string;
  data: ApiJobTitle;
}

export interface ApiEducationalLevel {
  id: number;
  name: string;
  create_at: string;
  update_at: string;
}

export interface ApiEducationalLevelsResponse {
  success: boolean;
  message: string;
  data: ApiPaginatedData<ApiEducationalLevel>;
}

export interface ApiSingleEducationalLevelResponse {
  success: boolean;
  message: string;
  data: ApiEducationalLevel;
}

export interface ApiCompany {
  id: number;
  name: string;
  address: string;
  logo: string | null;
  create_at: string;
  update_at: string;
}

export interface ApiCompaniesResponse {
  success: boolean;
  message: string;
  data: ApiPaginatedData<ApiCompany>;
}

export interface ApiSingleCompanyResponse {
  success: boolean;
  message: string;
  data: ApiCompany;
}

export interface ApiDeviceFingerprint {
  id: number;
  name: string;
  sn: string;
  location: string;
  ip_address: string;
  port: number | null;
  password: string;
  create_at: string;
  update_at: string;
}

export interface ApiDeviceFingerprintsResponse {
  success: boolean;
  message: string;
  data: ApiPaginatedData<ApiDeviceFingerprint>;
}

export interface ApiSingleDeviceFingerprintResponse {
  success: boolean;
  message: string;
  data: ApiDeviceFingerprint;
}

export interface ApiDataReception {
  id: number;
  user_id: number | null;
  timestamp: string | null;
  status: string;
  finger_print_data: string;
  device_finger_print: number | null;
  create_at: string;
  update_at: string;
}

export interface ApiDataReceptionsResponse {
  success: boolean;
  message: string;
  data: ApiPaginatedData<ApiDataReception>;
}

export interface ApiSingleDataReceptionResponse {
  success: boolean;
  message: string;
  data: ApiDataReception;
}

export interface ApiEmployee {
  id?: number;
  name: string;
  birth_date: string | null;
  basic_salary: number | null;
  secondary_salary: number | null;
  currency_basic: string | number | null;
  currency_secondary: string | number | null;
  job_title: number | null;
  educational_level: number | null;
  company: number | null;
  type_of_employee: string | number | null;
  marital_status: string | number | null;
  create_at?: string;
  update_at?: string;
}

export interface ApiEmployeesResponse {
  success: boolean;
  message: string;
  data: ApiPaginatedData<ApiEmployee>;
}

export interface ApiSingleEmployeeResponse {
  success: boolean;
  message: string;
  data: ApiEmployee;
}

export interface ApiEmployeeFingerprint {
  id?: number;
  employee_name?: string;
  finger_print_id: string;
  finger_print_data: string;
  create_at?: string;
  update_at?: string;
  employee: number | null;
  device_finger_print: number | null;
}

export interface ApiEmployeeFingerprintsResponse {
  success: boolean;
  message: string;
  data: ApiPaginatedData<ApiEmployeeFingerprint>;
}

export interface ApiSingleEmployeeFingerprintResponse {
  success: boolean;
  message: string;
  data: ApiEmployeeFingerprint;
}

export interface ApiShift {
  id?: number;
  name: string;
  start_time: string | null;
  end_time: string | null;
  days: number[];
  employees: number[];
  create_at?: string;
  update_at?: string;
}

export interface ApiShiftsResponse {
  success: boolean;
  message: string;
  data: ApiPaginatedData<ApiShift>;
}

export interface ApiSingleShiftResponse {
  success: boolean;
  message: string;
  data: ApiShift;
}

export interface ApiAttendance {
  id?: number;
  employee_name?: string;
  shift_name?: string;
  date: string | null;
  time_in: string | null;
  time_out: string | null;
  is_present: boolean;
  is_present1: number | null;
  note: string;
  create_at?: string;
  update_at?: string;
  employee: number | null;
  shift: number | null;
}

export interface ApiAttendancesResponse {
  success: boolean;
  message: string;
  data: ApiPaginatedData<ApiAttendance>;
}

export interface ApiSingleAttendanceResponse {
  success: boolean;
  message: string;
  data: ApiAttendance;
}

export interface ApiLawFingerprinter {
  id?: number;
  name: string;
  time_from_which_fingerprint_entry_is_received: string | null;
  entry_grace_period: string | null;
  consider_absent_if_late_by: string | null;
  early_departure_allowance: string | null;
  last_time_to_accept_finger_print: string | null;
  time_from_which_fingerprint_out_is_received: string | null;
  deduct_for_missing_check_in: boolean;
  deduct_for_missing_check_out: boolean;
  create_at?: string;
  update_at?: string;
  shift: number | null;
}

export interface ApiLawFingerprintersResponse {
  success: boolean;
  message: string;
  data: ApiPaginatedData<ApiLawFingerprinter>;
}

export interface ApiSingleLawFingerprinterResponse {
  success: boolean;
  message: string;
  data: ApiLawFingerprinter;
}


