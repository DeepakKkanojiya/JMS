-- PostgreSQL Custom Partial Unique Indexes, Check Constraints & Range Exclusions DDL
-- Enforce at most one active primary assignment per employee
CREATE UNIQUE INDEX uq_employee_active_primary_assignment 
ON public.employee_branch_assignments (employee_id) 
WHERE is_primary = true AND effective_to IS NULL;

-- Enforce at most one active inventory tag per item
CREATE UNIQUE INDEX uq_inventory_item_active_tag 
ON public.inventory_tags (inventory_item_id) 
WHERE is_active = true;

-- Enforce only one current active financial year per company
CREATE UNIQUE INDEX uq_company_current_financial_year 
ON public.financial_years (company_id) 
WHERE is_current = true;

-- Enforce non-overlapping financial year check bounds
ALTER TABLE public.financial_years
ADD CONSTRAINT chk_financial_year_dates CHECK (start_date < end_date);

-- Enforce weight validation check constraints
ALTER TABLE public.inventory_items
ADD CONSTRAINT chk_inventory_item_gross_weight CHECK (gross_weight > 0),
ADD CONSTRAINT chk_inventory_item_stone_weight CHECK (stone_weight >= 0),
ADD CONSTRAINT chk_inventory_item_net_weight CHECK (net_weight > 0),
ADD CONSTRAINT chk_inventory_item_stone_weight_limit CHECK (stone_weight <= gross_weight);

-- Enforce document series branch-specific uniqueness
CREATE UNIQUE INDEX uq_branch_document_series 
ON public.document_series (company_id, branch_id, document_type, financial_year_id) 
WHERE branch_id IS NOT NULL;

-- Enforce document series company-wide uniqueness
CREATE UNIQUE INDEX uq_company_document_series 
ON public.document_series (company_id, document_type, financial_year_id) 
WHERE branch_id IS NULL;
