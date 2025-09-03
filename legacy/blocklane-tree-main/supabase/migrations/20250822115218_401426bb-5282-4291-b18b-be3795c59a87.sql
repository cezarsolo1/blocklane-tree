-- Add new columns for AUTO_SEND access permissions and details
ALTER TABLE public.tickets 
ADD COLUMN access_permission text,
ADD COLUMN access_method text,
ADD COLUMN neighbor_details text,
ADD COLUMN key_box_details text,
ADD COLUMN intercom_details text,
ADD COLUMN extra_instructions text,
ADD COLUMN has_pets boolean,
ADD COLUMN pet_details text,
ADD COLUMN has_alarm boolean,
ADD COLUMN alarm_details text,
ADD COLUMN special_notes text,
ADD COLUMN cost_acknowledgment boolean;