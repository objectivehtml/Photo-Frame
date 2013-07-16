<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

/**
 * Photo Frame
 * 
 * @package		Photo Frame
 * @author		Justin Kimbrell
 * @copyright	Copyright (c) 2012, Objective HTML
 * @link 		http://www.objectivehtml.com/photo-frame
 * @version		0.7.0
 * @build		20121031
 */

if(!defined('PHOTO_FRAME_VERSION'))
{
	require PATH_THIRD . 'photo_frame/config/photo_frame_config.php';
}

if(!class_exists('PhotoFrameButton'))
{
	require_once PATH_THIRD . 'photo_frame/libraries/PhotoFrameButton.php';
}
			

class Photo_frame_ft extends EE_Fieldtype {

	public $info = array(
		'name'			=> 'Photo Frame',
		'version'		=> PHOTO_FRAME_VERSION
	);
	
	public $grid 				= FALSE;
	public $matrix 				= FALSE;
	public $low_variables		= FALSE;
	public $has_array_data 		= TRUE;
	public $safecracker			= FALSE;
	public $is_draft			= FALSE;
	public $col_id				= FALSE;
	public $publish				= FALSE;
	public $zenbu_data			= array();
	public $upload_prefs;
	
	private $default_settings	= array(
	);
	
	private $data;
	
	public $default_params = array(
		'id'              => '',
		'class'           => '',
		'alt'             => '',
		'width'           => '',
		'height'          => '',
		'dir'             => '',
		'lang'            => '',
		'title'           => '',
		'source'          => NULL, // [NULL|original]
		//'parse_filenames' => 'true', // [framed|original],
		'order_by'		  => 'order',
		'sort'			  => 'asc',
		'limit' 		  => FALSE,
		'offset' 		  => 0,
		'directory'  	  => FALSE,
		'pre_loop'  	  => TRUE,
		'size' 			  => NULL
	);
	
	public $exclude_params = array(
		'source',
		//'parse_filenames',
		'limit',
		'offset',
		'directory',
		'size',
		'order_by',
		'sort',
		'directory'
	);	

	public function __construct()
	{
		$this->EE =& get_instance();

		if(isset($this->EE->safecracker_lib))
		{
			$this->safecracker = TRUE;
		}
	
		$this->EE->load->add_package_path(PATH_THIRD . 'photo_frame');

		/* -----------------------------------------
			Load assets for Zenbu results
		----------------------------------------- */
		
		if(isset($this->EE->zenbu_get))
		{
			if(!isset($this->EE->theme_loader))
			{
				$this->EE->load->library('theme_loader');
			}
			
			$this->EE->theme_loader->module_name = 'photo_frame';
			$this->EE->theme_loader->css('photo_frame');
		}
	}
	
	/*
	public function zenbu_js()
	{
		$this->EE->theme_loader->js_directory = 'javascript';
		
		return array('https://maps.google.com/maps/api/js?sensor=true&amp;key=&amp;language=en');
	}
	
	public function zenbu_css()
	{
		$this->EE->theme_loader->css_directory = 'css';
		
		return array('photo_frame');
	}
	*/
		
	// --------------------------------------------------------------------
	
	/**
	 * Installs the plugin by returning the default settings array.
	 *
	 * @access	public
	 * @return	array
	 */
	 
	function install()
	{
		return $this->default_settings;
	}
	
	/**
	 * Displays the fieldtype
	 *
	 * @access	public
	 * @param 	array
	 * @return	string
	 */
	 
	public function display_cell($data)
	{
		$this->matrix = TRUE;
		
		return $this->display_field($data, $this->settings);
	}
	
	public function display_cell_settings($data)
	{
		$this->matrix = TRUE;
			
		return $this->display_settings($data);
	}
	
	public function display_var_field($data)
	{
		$this->low_variables = TRUE;
		
		return $this->display_field($data);
	}
	
	public function zenbu_result_query($rules, $field_id, $fieldtypes, $already_queried, $installed_addons, $settings)
	{
		$extra_options = $settings['extra_options']['field_'.$field_id];
										
		$this->EE->load->library('photo_frame_colors');
		$this->EE->load->library('photo_frame_sql');
		
		$color     = FALSE;
		$mix_prox  = NULL;
		$max_prox  = NULL;
		$min_color = NULL;
		$max_color = NULL;
		
		foreach($rules as $rule)
		{
			if($rule['field'] == 'field_'.$field_id)
			{
				$color = $rule['val'];
			}
		}
		
		$min_prox  = $extra_options['min_proximity'];
		$max_prox  = $extra_options['max_proximity'];
		$min_color = $extra_options['min_color_depth'];
		$max_color = $extra_options['max_color_depth'];
		
		$having = $this->EE->photo_frame_sql->get_having($min_prox, $max_prox, $min_color, $max_color);		
		$color  = $this->EE->photo_frame_colors->color_index($color);
		
		$this->EE->session->set_cache('photo_frame', 'color', $color);
		
		if($color)
		{
			$this->EE->db->select($this->EE->photo_frame_sql->get_select($color), FALSE);
			$this->EE->db->having($having, FALSE);
		}		
		
		$this->EE->db->join('photo_frame', 'channel_titles.entry_id = photo_frame.entry_id');
		$this->EE->db->join($this->EE->photo_frame_sql->get_join($color, $having), 'photo_frame.id = photo_frame_colors.photo_id');
		
	}
	
	public function zenbu_field_extra_settings($table_col, $channel_id, $extra_options)
	{		
		if(!class_exists('InterfaceBuilder'))
		{
				require_once(PATH_THIRD . 'photo_frame/libraries/InterfaceBuilder/InterfaceBuilder.php');
		}
		
		$fields = array(
			'min_proximity' => array(
				'label'       => 'Min Color Proximity',
				'description' => 'This is the minimum color proximity. The color proximity is the value used to determine if a particular color is in the same proximity of the color being searched. The smaller the number the closer to an exact match the colors must be. Increase the number to make the search less strict. The default value is <b>0</b>.<br><br>Use the following equation to figure out the best threshold for you.<br><b>(R - Ri)^2 + (G - Gi)^2 + (B - Bi)^2</b>',
			),	
			'max_proximity' => array(
				'label'       => 'Maximum Color Proximity',
				'description' => 'This is the maximum color proxmity. The color proximity is the value used to determine if a particular color is in the same proximity of the color being searched. The smaller the number the closer to an exact match the colors must be. Increase the number to make the search less strict. The default value is <b>12000</b>.<br><br>Use the following equation to figure out the best threshold for you.<br><b>(R - Ri)^2 + (G - Gi)^2 + (B - Bi)^2</b>',
			),	
			'min_color_depth' => array(
				'label'       => 'Minimum Color Depth',
				'description' => 'The color depth allows you to choose how many colors to search. This settings allows you to define the minimum depth to search. The default is <b>0</b>.',
			),	
			'max_color_depth' => array(
				'label'       => 'Maximum Color Depth',
				'description' => 'The color depth allows you to choose how many colors to search. For instance, by default Photo Frame indexes the 8 most used colors in a photo. This settings allows you to define the maximum depth to search. The default is <b>3</b>.',
			)	
		);
		
		$data  = array();
		$count = 1;
		
		if(!empty($extra_options))
		{
			$options = array();
			
			foreach($extra_options as $name => $option)
			{
				$options[$name] = $option;
			}
		}
		
		foreach($fields as $field_name => $field)
		{
			$orig_name  = $field_name;
					//	  'settings['.$channel_id.']['.$table_col.'][matrix_option_1]'
			$field_name = 'settings['.$channel_id.']['.$table_col.'][' . $field_name . ']';
			
			$vars = array(
				'label'       => $field['label'],
				'description' => $field['description'],
				'field'       => InterfaceBuilder::field($field_name, $field)->display_field(isset($extra_options[$orig_name]) ? $extra_options[$orig_name] : FALSE),
				'first_row'   => count($fields) == 1 ? TRUE : FALSE,
				'last_row'    => count($fields) == $count ? TRUE : FALSE
			);
			
			$data[$orig_name] = $this->EE->load->view('zenbu_settings', $vars, TRUE);
			
			$count++;
		}
		
		return $data;
	}
	
	public function zenbu_get_table_data($entry_ids, $field_ids, $channel_id, $output_upload_prefs, $settings, $rel_array)
	{
		$this->EE->load->library('photo_frame_lib');
		
		$new_entry_ids = array();
		
		foreach($entry_ids as $index => $entry_id)
		{
			$new_entry_ids[] = 'or '.$entry_id;	
		}
		
		$new_field_ids = array();
		
		foreach($field_ids as $index => $field_id)
		{
			$new_field_ids[] = 'or '.$field_id;	
		}
		
		$color         = $this->EE->session->cache('photo_frame', 'color');
		$settings      = $this->EE->session->cache('zenbu', 'settings');
		$extra_options = $settings['setting'][$channel_id]['extra_options']['field_'.$field_id];
		
		$photos = $this->EE->photo_frame_model->get_zenbu_photos($new_entry_ids, $new_field_ids, $color, $extra_options)->result();
		
		foreach($photos as $index => $photo)
		{
			$photo = (array) $photo;
			
			$photo['url']          = $this->EE->photo_frame_model->parse($photo['file'], 'url');
			$photo['thumb_url']    = $this->EE->photo_frame_model->parse($this->EE->photo_frame_lib->swap_filename($photo['original_file_name'], $photo['original_file'], '_thumbs/'), 'url');
			$photo['original_url'] = $this->EE->photo_frame_model->parse($photo['original_file'], 'url');
			
			$photo = (object) $photo;
			
			$photos[$index] = $photo;
			
			$this->zenbu_data[$photo->entry_id][$photo->field_id][] = $photo;
		}
		
		$this->EE->session->set_cache('photo_frame', 'zenbu_data', $this->zenbu_data);
	}
	
	function zenbu_display($entry_id, $channel_id, $data, $table_data, $field_id, $settings, $rules, $upload_prefs, $installed_addons)
	{		
		$this->zenbu_data = $this->EE->session->cache['photo_frame']['zenbu_data'];
		
		$photos = isset($this->zenbu_data[$entry_id][$field_id]) ? $this->zenbu_data[$entry_id][$field_id] : array();
		
		$vars   = array(
			'photos' => $photos
		);
		
		return $this->EE->load->view('zenbu_display', $vars, TRUE);	
	}
	
	public function grid_display_field($data)
	{
		$this->grid = TRUE;
		
		// Temp bug fix. Delete before release
		$this->settings['field_label'] = 'Gallery';
		
		return $this->display_field($data);
	}
	
	public function display_field($data)
	{		
		// Check to see if we are loading a draft into the publish view
		if (isset($this->EE->session->cache['ep_better_workflow']['is_draft']) && $this->EE->session->cache['ep_better_workflow']['is_draft']) {
			$this->is_draft = TRUE;
			$data = $this->EE->input->get('entry_id', TRUE);
		}
	
		if(!isset($this->EE->theme_loader))
		{
			$this->EE->load->library('theme_loader');
		}
		
		$this->EE->theme_loader->module_name = 'photo_frame';
		$this->EE->theme_loader->css('photo_frame');
		
		$this->EE->load->config('photo_frame_config');
		$this->EE->load->library('photo_frame_lib');
			
		$this->EE->cp->add_js_script(array('ui' => array('slider', 'draggable')));		

		$effects = $this->EE->photo_frame_lib->get_effects();
		
		$default_settings = array(
			'photo_frame_display_info'       => 'true',
			'photo_frame_display_meta'       => 'false',
			'photo_frame_min_photos'         => 0,
			'photo_frame_max_photos'         => 0,
			'photo_frame_jpeg_compression'   => 100,
			'photo_frame_resize_max_width'   => FALSE,
			'photo_frame_resize_min_height'  => FALSE,
			'photo_frame_cropped_max_width'  => FALSE,
			'photo_frame_cropped_max_height' => FALSE,
			'photo_frame_cropped_width'      => FALSE,
			'photo_frame_cropped_height'     => FALSE,
			'photo_frame_max_size'			 => FALSE,
			'photo_frame_delete_files'		 => FALSE,
			'photo_frame_file_browser'		 => 'true',
			'photo_frame_file_upload'		 => 'true',
			'photo_frame_sortable'			 => 'true',
			'photo_frame_upload_helper'		 => '',
			'photo_frame_assets_safecracker' => 'true',
			'photo_frame_assets'			 => 'false',
			'photo_frame_button_text'	     => '',
			'photo_frame_browse_button_text' => '',
			'photo_frame_drop_zone'			 => 'true',
			'photo_frame_force_crop'		 => 'true',
			'photo_frame_disable_crop'	     => 'false',
			'photo_frame_show_editor_cp'     => 'true',
			'photo_frame_show_editor_sc'     => 'true',
			// 'photo_frame_show_editor_lv'     => 'true',
			'photo_frame_show_editor_mx'     => 'true',
			'photo_frame_folder_id' 		 => FALSE
		);
	
		$settings = array_merge($default_settings, $this->settings);
	
		$assets_installed = $this->EE->photo_frame_lib->assets_installed();
		
		// Make sure that Assets is installed
		if($assets_installed)
		{
			require_once PATH_THIRD.'assets/helper.php';
		
			$assets_helper = new Assets_helper;
			$assets_helper->include_sheet_resources();
		}
		
		if(isset($this->EE->safecracker_lib))
		{
			$this->safecracker = TRUE;
		}
		
		$this->EE->theme_loader->module_name = 'photo_frame';
				
		$this->EE->theme_loader->output('PhotoFrame.Lang    = '.$this->_lang().';');
		$this->EE->theme_loader->output('PhotoFrame.Actions = '.$this->_actions($settings).';');
		
		$this->EE->theme_loader->css('photo_frame');
		$this->EE->theme_loader->css('smoothness/jquery-ui-1.10.3.custom.css');
		$this->EE->theme_loader->css('jquery.jcrop');
		$this->EE->theme_loader->javascript('base');
		$this->EE->theme_loader->javascript('localStorageDB');
		$this->EE->theme_loader->javascript('spectrum');
		$this->EE->theme_loader->javascript('photo_frame');
		$this->EE->theme_loader->javascript('jquery.ui');
		$this->EE->theme_loader->javascript('jquery.ui.widget');
		$this->EE->theme_loader->javascript('jquery.iframe-transport');
		$this->EE->theme_loader->javascript('jquery.fileupload');
		$this->EE->theme_loader->javascript('jquery.activity-indicator');
		$this->EE->theme_loader->javascript('jquery.load-image');
		$this->EE->theme_loader->javascript('jquery.jcrop');
		$this->EE->theme_loader->javascript('jquery.color');
		$this->EE->theme_loader->javascript('json2');
		
		if($settings['photo_frame_show_editor_cp'] == 'true' && !$this->safecracker ||
		   $settings['photo_frame_show_editor_sc'] == 'true' && $this->safecracker ||
//$settings['photo_frame_show_editor_lv'] && $this->low_variables ||
		   $settings['photo_frame_show_editor_mx'] == 'true' && $this->matrix)
		{
			$buttons = array();
			
			$js_directory = $this->EE->theme_loader->js_directory;
			
			foreach($this->EE->photo_frame_lib->get_buttons() as $obj)
			{
				$button = $obj->getClassName();
		
				if(!empty($button))
				{
					$buttons[] = $button;

					$this->EE->theme_loader->module_name  = $obj->getModuleName();				
					$this->EE->theme_loader->js_directory = $obj->getJsDirectory();
				
					if(is_array($obj->javascript()))
					{
						foreach($obj->javascript() as $js)
						{
							$this->EE->theme_loader->javascript($js);
						}
					}
					
					if(is_array($obj->css()))
					{
						foreach($obj->css() as $css)
						{
							$this->EE->theme_loader->css($css);
						}
					}
				}
			}	
						
			$this->EE->theme_loader->js_directory = $js_directory;			
		}
		else {
			$buttons = array();
		}
		
		$entry_id  = empty($data) && $data !== FALSE ? $data : ($this->EE->input->get_post('entry_id') ? $this->EE->input->get_post('entry_id') : (isset($this->EE->safecracker) ? $this->EE->safecracker->entry('entry_id') : 0));
			
			
		$uid  = $this->field_name.'_wrapper';
		
		if($this->matrix)
		{
			$uid = md5($this->cell_name);
		}
		else
		{
			$uid = md5($this->field_name);
		}
		
		$preview_styles = NULL;
	
		$saved_data = array();
		$new_photos = array();
		
		$new_photos_set = FALSE;
		$edit_photos_set = FALSE;
		
		if($this->matrix)
		{
			if(!empty($data) && is_array($data))
			{
				$new_photos_set  = $this->EE->photo_frame_model->has_new_photos($data);
				$edit_photos_set = $this->EE->photo_frame_model->has_edit_photos($data);
			}
		}
		elseif(isset($_POST[$this->field_name]))
		{
			$new_photos_set  = $this->EE->photo_frame_model->has_new_photos($_POST[$this->field_name]);
			$edit_photos_set = $this->EE->photo_frame_model->has_edit_photos($_POST[$this->field_name]);
		}
		
		$orig_data = $data;
		
		if(is_array($data))
		{
			$data = 0;
		}
		
		$where = array(
			'field_id' => $this->field_id, 
			'entry_id' => $data
		);
		
		if($this->matrix && !empty($data))
		{
			unset($where['entry_id']);
			
			if (!empty($this->var_id))
 			{
 				unset($where['field_id']);
 				$where['var_id'] = $this->var_id;
 			}

			$where['col_id'] = $this->col_id;
			$where['row_id'] = $data;
		}
		
		// var_dump($data);exit();
		
		if($this->low_variables && !empty($data))
		{
			unset($where['entry_id']);
			unset($where['field_id']);
			
			$where['var_id'] = $this->var_id;
		}

		$saved_data = $this->EE->photo_frame_model->get_photos(array(
			'where' => $where
		));

		if($this->is_draft)
		{
			$draft_data = $this->EE->photo_frame_model->get_photos(array('where' => array(
				array_merge($where, array('is_draft' => 1))
			)));
			
			if($draft_data->num_rows() > 0)
			{
				$saved_data = $draft_data;
			}
		}
		
		if($saved_data->num_rows() > 0 || $new_photos_set || $edit_photos_set)
		{
			if($saved_data->num_rows() > 0)
			{
				$saved_data = $saved_data->result_array();
			}
			else
			{
				$saved_data = array();
			}
			
			$post_data = array();
			
			if($this->matrix)
			{
				$post_data = $orig_data;
			}
			else if(isset($_POST[$this->field_name]))
			{
				$post_data = $_POST[$this->field_name];
			}
			
			if($new_photos_set)
			{
				foreach($post_data as $index => $new_photo)
				{
					if(isset($new_photo['new']))
					{
						$new_photo = $new_photo['new'];
						
						$photo = json_decode(html_entity_decode($new_photo));
						
						if(!is_null($photo))
						{
							$photo = (array) $photo;
							$photo['new'] 		= TRUE;
							$new_photos[$index] = $photo;
							$saved_data[] 	    = $photo;
						}
					}
				}
			}
			
			if($edit_photos_set)
			{
				foreach($post_data as $index => $edit_photo)
				{
					if(isset($edit_photo['edit']))
					{
						$edit_photo = $edit_photo['edit'];
										
						$photo = json_decode(html_entity_decode($edit_photo));
						
						if(!is_null($photo))
						{
							$photo = (array) $photo;
							$photo['new'] 		 = FALSE;
							$edit_photos[$index] = $photo;
							$saved_data[] 	     = $photo;
						}
					}
				}	
			}
				
			if(count($saved_data) > 0)
			{
				$directory  = $this->EE->photo_frame_model->get_upload_group($this->settings['photo_frame_upload_group']);
				// $saved_data = $this->EE->photo_frame_model->parse_filenames($saved_data->result_array());
			
				foreach($saved_data as $index => $row)
				{
					$orig_path = $this->EE->photo_frame_model->parse($row['original_file'], 'server_path');					
					$file_path = $this->EE->photo_frame_model->parse($row['file'], 'server_path');
					
					$orig_url  = $this->EE->photo_frame_model->parse($row['original_file']);
					$file_url  = $this->EE->photo_frame_model->parse($row['file'], 'url');
					
					$new_row                       = $row;
					$new_row['saved_data']         = $row;
					$new_row['directory']          = $directory;
					$new_row['file_url']		   = $file_url;	
					$new_row['file_path']          = $file_path;
					$new_row['original_url']	   = $orig_url;
					$new_row['original_path']      = $orig_path;
					
					$saved_data[$index]            = (object) $new_row;
				}
			}
		}
		else
		{
			$saved_data = array();
		}
		
		if(!isset($settings['photo_frame_upload_group']))
		{
			show_error('You don\'t have a file upload group set');
		}
		
		$min_width  = (int) $this->setting('min_width', 0);
		$min_height = (int) $this->setting('min_height', 0);
		
		$max_width  = (int) $this->setting('max_width', 0);
		$max_height = (int) $this->setting('max_height', 0);
		
		$jcrop_settings = array(
			// 'setSelect'   => $this->setting('default_location', ''),
			// 'aspectRatio' => str_replace(':', ' / ', $this->setting('aspect_ratio', NULL))
		);
		
		$default_location = $this->setting('default_location', '');
		
		if(!empty($default_location))
		{
			$default_location = explode(',', $this->setting('default_location', ''));
			
			foreach($default_location as $index => $coord)
			{
				$default_location[$index] = (float) $coord;
			}
			
			$jcrop_settings['setSelect'] = $default_location;
		}
		
		$aspect_ratio = $this->setting('aspect_ratio', NULL);
		
		if(!empty($aspect_ratio))
		{
			$aspect_ratio = explode(':', $aspect_ratio);
			
			if(!isset($aspect_ratio[1]))
			{
				$aspect_ratio[1] = 1;	
			}
			
			$jcrop_settings['aspectRatio'] 	     = (float) $aspect_ratio[0] / (float) $aspect_ratio[1];
			$jcrop_settings['aspectRatioString'] = "{$aspect_ratio[0]}:{$aspect_ratio[1]}";
		}
		
		if($min_width > 0 && $min_height > 0)
		{
			$jcrop_settings['minSize'] = array($min_width, $min_height);
			$jcrop_settings['maxSize'] = array($max_width, $max_height);
		}
		
		$directory = $this->EE->photo_frame_model->get_upload_group($this->settings['photo_frame_upload_group']);
		
		$jcrop_settings = (object) $jcrop_settings;
		
		$button_text = empty($settings['photo_frame_button_text']) ? lang('photo_frame_button_text') : $settings['photo_frame_button_text'];
		
		$browse_button_text = empty($settings['photo_frame_browse_button_text']) ? lang('photo_frame_browse_button_text') : $settings['photo_frame_browse_button_text'];
		
		$instructions = empty($settings['photo_frame_instructions']) ? lang('photo_frame_instructions') : $settings['photo_frame_instructions'];
		
		$size = isset($settings['photo_frame_default_size']) && !empty($settings['photo_frame_default_size']) ? '\''.$settings['photo_frame_default_size'].'\'' : 'false';
		
		$resize 	= $this->EE->photo_frame_lib->build_size($settings, 'cropped');
		$resize_max = $this->EE->photo_frame_lib->build_size($settings, 'cropped_max');
		
		foreach($saved_data as $index => $data)
		{
			if(is_string($data->manipulations))
			{
				$saved_data[$index]->manipulations = json_decode($data->manipulations);
			}
			
			foreach($this->EE->photo_frame_lib->get_buttons() as $obj)
			{
				$saved_data[$index] = $obj->prepSavedData($data);
			}
			
		}

		$del_id = isset($this->col_id) ? $this->col_id : (isset($this->var_id) ? $this->var_id : $this->field_id);

		$settings_js 	= '{
			fieldName: \''.($this->matrix ? $this->cell_name : $this->field_name).'\',
			fieldId: \''.$this->field_id.'\',
			siteId: '.config_item('site_id').',
			delId: '.$del_id.',
			dirId: '.$this->settings['photo_frame_upload_group'].',
			colId: '.(isset($this->col_id) && $this->col_id ? '\'col_id_'.$this->col_id.'\'' : 'false').',
			varId: '.(isset($this->var_id) && $this->var_id ? $this->var_id : 'false').',
			rowId: '.(isset($this->row_id) && $this->row_id ? '\'row_id_'.$this->row_id.'\'' : 'false').',
			photos: '.json_encode($saved_data).',
			buttons: '.json_encode($buttons).',
			settings: '.json_encode($jcrop_settings).',
			useAssets: '.$settings['photo_frame_assets'].',
			directory: '.json_encode($directory).',
			infoPanel: '.$settings['photo_frame_display_info'].',
			instructions: '.json_encode($instructions).',
			size: '.$size.',
			minPhotos: '.(!empty($settings['photo_frame_min_photos']) ? $settings['photo_frame_min_photos'] : 0).',
			maxPhotos: '.(!empty($settings['photo_frame_max_photos']) ? $settings['photo_frame_max_photos'] : 0).',
			showMetaOnSave: '.($settings['photo_frame_display_meta'] == 'true' ? 'true' : 'false').',
			compression: '.(!empty($settings['photo_frame_jpeg_compression']) ? $settings['photo_frame_jpeg_compression'] : 100).',
			buttonText: '.json_encode($button_text).',
			resize: '.json_encode($resize).',
			resizeMax: '.json_encode($resize_max).',
			sortable: '.$settings['photo_frame_sortable'].',
			forceCrop: '.$settings['photo_frame_force_crop'].',
			disableCrop: '.$settings['photo_frame_disable_crop'].',
			callbacks: {
				init: function() {
					var t = this;
					
					'.((isset($this->settings['col_id']) && $this->grid) ? 't.gridId = '.$this->settings['col_id'].';' : '').'
					
					this.safecracker = '.($this->safecracker ? 'true' : 'false').';
					
					this.isAssetsInstalled = function() {
						if(typeof Assets == "object" && this.useAssets) {
							return true;
						}
						return false;
					};
					
					if(t.isAssetsInstalled()) {
						t.assetSheet = new Assets.Sheet({
						    multiSelect: true,
						    filedirs: ['.$this->settings['photo_frame_upload_group'].'],
						    kinds: [\'image\'],
						    onSelect: function(files) {
						    	t.edit = false;

						    	if(files.length == 1) {
						    		t.showProgress(0, function() {
							    		t._fileBrowserResponseHandler(files[0].url, files[0].id, function(response) {
						    				t.showProgress(100, function() {
								    			t._uploadResponseHandler(response);
							    			});	
							    		});
							    	});
						    	}
						    	else {
					    			t.showProgress(0, function() {
							    		var count = 1;
							    		
								    	$.each(files, function(i, file) {
									    	t._fileBrowserResponseHandler(file.url, function(response) {
									    		var progress = parseInt(count / files.length * 100);
									    		t._assetResponseHandler(response, progress);
									    		count++;
									    	});
								    	});
					    			});
						    	}
						    }
						});
					}
					else {
						if(!t.safecracker) {
							$.ee_filebrowser.add_trigger(t.ui.browse, t.directory.id, {
								content_type: \'images\',
								directory:    t.directory.id,
							}, function(file, field){
								t.showProgress(0, function() {
						    		t._fileBrowserResponseHandler(file.rel_path, function(response) {
						    			t.showProgress(100, function() {
							    			t._uploadResponseHandler(response);
						    			});				    			
						    		});
						    	});
							});
						}
					}
					
				},
				responseHandlerSettings: function() {
					var data = {};
					
					'.($settings['photo_frame_folder_id'] ? 'data.folderId = '.$settings['photo_frame_folder_id'] .';' : '').'
					
					return data;
				},
				browse: function() {
					if(this.isAssetsInstalled()) {
						this.assetSheet.show();
					}
				},
				buildUploadUrl: function() {
					return PhotoFrame.Actions.upload_photo + \'&dir_id='.$settings['photo_frame_upload_group'].(isset($this->var_id) ? '&var_id=' . $this->var_id : '&field_id='.$this->field_id).($settings['photo_frame_folder_id'] ? '&folder_id='.$settings['photo_frame_folder_id'] : '').($this->grid ? '&grid_id='.$grid_id : '' ).'\';
				}
			}
		}';

		if($this->matrix)
		{
			$this->EE->theme_loader->output('
				
				if(!PhotoFrame.matrix[\'col_id_'.$this->col_id.'\']) {
					PhotoFrame.matrix[\'col_id_'.$this->col_id.'\'] = {};
				}

				PhotoFrame.matrix[\'col_id_'.$this->col_id.'\'][\''.$uid.'\'] = '.$settings_js.';
				
				Matrix.bind(\'photo_frame\', \'display\', function(cell) {
					//if(cell.row.isNew) {
						var uid      = cell.dom.$td.find(\'.photo-frame-wrapper\').attr(\'id\');
						var settings = PhotoFrame.matrix[cell.col.id][uid];

						settings.fieldName = cell.field.id+"["+cell.row.id+"]["+cell.col.id+"]";
				
						new PhotoFrame.Factory(cell.dom.$td, settings);
					//}
				});'
			);
		}
		else if($this->grid)
		{
			
			$this->EE->theme_loader->output('
				
				if(!PhotoFrame.Grid) {
					PhotoFrame.Grid = [];
				}
				
				PhotoFrame.Grid[\''.$this->settings['col_id'].'\'] = '.$settings_js.';
				
				Grid.bind(\'photo_frame\', \'display\', function(cell) {
					var id	     = $(cell).data(\'column-id\');					
					var settings = PhotoFrame.Grid[id];
					var isNew    = cell.data("row-id") ? true : false;

					// settings.fieldName = cell.field.id+"["+cell.row.id+"]["+cell.col.id+"]";
			
					new PhotoFrame.Factory(cell, settings);
				});
			');
			
			// var_dump($this->settings);exit();
		}
		else		
		{			
			$this->EE->theme_loader->output('$(document).ready(function() {				
				new PhotoFrame.Factory($("#'.$uid.'"), '.$settings_js.');
			});');
		}
		
		$total_photos = count($saved_data);
		
		$max_photos   = !empty($settings['photo_frame_max_photos']) ? $settings['photo_frame_max_photos'] : 0;
		$overlimit    = $max_photos > 0 && $max_photos <= $total_photos ? TRUE : FALSE; 
		
		$theme = FALSE;
		
		if(isset($settings['photo_frame_cp_theme']) && !empty($settings['photo_frame_cp_theme']))
		{
		    $theme = $this->EE->photo_frame_lib->get_theme($settings['photo_frame_cp_theme']);
		    
		    if(is_object($theme))
		    {
		    	$css_dir = $this->EE->theme_loader->css_directory;
		    	$js_dir  = $this->EE->theme_loader->js_directory;
		    	
		    	$this->EE->theme_loader->module_name   = $theme->getModuleName();
		    	$this->EE->theme_loader->css_directory = 'themes/'.$theme->getName().'/css';
		    	$this->EE->theme_loader->js_directory  = 'themes/'.$theme->getName().'/javascript';
		    	
			    foreach($theme->css() as $file)
			    {
	    		     $this->EE->theme_loader->css($file);   
			    }
			    
			    foreach($theme->javascript() as $file)
			    {
	    		     $this->EE->theme_loader->javascript($file);   
			    }
			    
		    	$this->EE->theme_loader->css_directory = $css_dir;
		    	$this->EE->theme_loader->js_directory  = $js_dir;		    	
		    }
		}
				
		foreach($saved_data as $index => $data)
		{
			if(isset($data->saved_data['sizes']))
			{
				if(is_string($data->saved_data['sizes']))
				{
					$data->saved_data['sizes'] = json_decode($data->saved_data['sizes']);
				}
			}
			else
			{
				$data->saved_data['sizes'] = NULL;
			}

			if(isset($data->saved_data['manipulations']))
			{
				if(is_string($data->saved_data['manipulations']))
				{
					$data->saved_data['manipulations'] = json_decode($data->saved_data['manipulations']);
				}
			}
			else
			{
				$data->saved_data['manipulations'] = '{}';
			}
		}
		
		if($this->low_variables)
		{	
			$var_id = $this->var_id;
			$var    = $this->EE->photo_frame_model->get_variable($var_id)->row();
		}

		$vars = array(
			'id'             => $this->field_id,
			'safecracker'    => $this->safecracker,
			'selector'       => $uid,
			'field_label'    => $this->low_variables ? $var->variable_label : (isset($settings['field_label']) ? $settings['field_label'] : ''),
			'field_name'     => ($this->matrix ? $this->cell_name : $this->field_name),
			'theme'          => $theme ? $theme->getWrapperClass() : '',
			'data'   	     => $saved_data,
			'new_photos'     => $new_photos,
			'preview_styles' => trim($preview_styles),
			'button_text'	 => $button_text,
			'browse_button_text' => $browse_button_text,
			'overlimit'	 	 => $overlimit,
			'assets'		 => FALSE,
			'drop_zone'	     => $settings['photo_frame_drop_zone'] == 'true' ? TRUE : FALSE,
			'file_browser'	 => $settings['photo_frame_file_browser'] == 'true' ? TRUE : FALSE,
			'file_upload'	 => $settings['photo_frame_file_upload'] == 'true' ? TRUE : FALSE,
			'upload_helper'	 => $settings['photo_frame_upload_helper'],
			'sortable'       => $settings['photo_frame_sortable'] == 'true' ? TRUE : FALSE,
			'disable_crop'   => $settings['photo_frame_disable_crop'] == 'true' ? TRUE : FALSE,
			'grid'			 => $this->grid
		);
		
		if($assets_installed && isset($settings['photo_frame_assets']) && $settings['photo_frame_assets'] == 'true')
		{
			$vars['assets'] = TRUE;
			
			if($this->safecracker && $settings['photo_frame_assets_safecracker'] == 'false')
			{
				$vars['file_browser'] = FALSE;
			}
		}
		
		return $this->EE->load->view('fieldtype', $vars, TRUE);
	}
	
	private function _lang()
	{
		$lang = array();
		
		foreach($this->EE->lang->language as $key => $value)
		{
			$pattern = '/^photo_frame_/';
			
			if(preg_match($pattern, $key))
			{
				$lang[preg_replace($pattern, '', $key)] = $value;
			}
		}
		
		return json_encode($lang);
	}
	
	private function _actions($settings)
	{
		$actions = $this->EE->photo_frame_model->get_actions();
		
		$actions['upload_photo'] .= '&dir_id='.$settings['photo_frame_upload_group'].(isset($this->var_id) ? '&var_id=' . $this->var_id : '&field_id='.$this->field_id);
		$actions['effects']       = $this->EE->theme_loader->theme_url() . 'photo_frame/img/effects/';
		
		return json_encode($actions);
	}
	
	public function replace_thumb($data, $params = array(), $tagdata)
	{
		$params['directory'] = '_thumbs';
		
		return $this->replace_tag($data, $params, $tagdata);
	}
	
	public function pre_loop($data)
	{
		$this->EE->load->model('photo_frame_model');
		
		$this->upload_prefs = $this->EE->photo_frame_model->get_file_upload_groups();
		
		if(!$this->low_variables)
		{
			// Check to see if we are loading a draft into the publish view
			if (isset($this->EE->session->cache['ep_better_workflow']['is_draft']) && $this->EE->session->cache['ep_better_workflow']['is_draft'])
			{
				$this->is_draft = TRUE;
			}
			
			
			$entry_ids = array();
			
			foreach($data as $entry_id)
			{
				$entry_ids[] = 'or '.$entry_id;
			}
			
			$data = $this->EE->photo_frame_model->get_photos(array(
				'where' => array(
					'entry_id' => $entry_ids,
					'site_id'  => config_item('site_id'),
					'is_draft' => $this->is_draft ? 1 : 0
				)
			));
			
			$photos = array();
			
			foreach($data->result() as $photo)
			{
				$photos[$photo->entry_id][$photo->field_id][] = (array) $photo;
			}
			
			$this->data = $photos;
		}
		else
		{
			$this->data = $this->EE->photo_frame_model->get_photos(array(
				'where' => array(
					'var_id'  => $this->var_id,
					'site_id' => config_item('site_id')
				)
			))->result_array();
		}
	}
	
	private function _get_photos($field_id, $pre_loop = TRUE)
	{
		// Set pre_loop to FALSE for earlier versions of EE
		if(version_compare(APP_VER, '2.5.0', '<'))
		{
			$pre_loop = FALSE;
		}

		if($this->low_variables)
		{
			return $this->data;
		}

		if(isset($this->row['entry_id']))
		{
			$entry_id = $this->row['entry_id'];
		
			$photos = isset($this->data[$entry_id]) ? $this->data[$entry_id] : array();

			if($pre_loop !== TRUE)
			{
				$photos = array($this->EE->photo_frame_model->get_photos(array(
					'where' => array(
						'entry_id' => $entry_id,
						'field_id' => $field_id,
						'is_draft' => 0
					)
				))->result_array());
			}
			
			if(isset($this->EE->session->cache['ep_better_workflow']) && $this->EE->session->cache['ep_better_workflow']['is_preview'])
			{
				$photos = array($this->EE->photo_frame_model->get_photos(array(
					'where' => array(
						'entry_id' => $entry_id,
						'field_id' => $field_id,
						'is_draft' => 1
					)
				))->result_array());
			}
		}
		else
		{
			if(isset($this->col_id))
			{
				$photos = array($this->EE->photo_frame_model->get_photos(array(
					'where' => array(
						'col_id' 	=> $this->col_id,
						'row_id' 	=> $this->row_id,
						'is_draft'	=> 0
					)
				))->result_array());
			}
		}

		// http://addon.dev/images/uploads/images/_framed/XyWGoI2p-596-776.png?date=1370229255
		
		$return = array();
		
		foreach($photos as $entry)
		{
			foreach($entry as $photo)
			{
				$valid = TRUE;
				
				if($photo['field_id'] != $field_id)
				{
					$valid = FALSE;	
				}
				
				if($valid)
				{
					$return[] = $photo;
				}				
			}
		}
		
		return $return;
	}

	public function replace_color_bar($data, $params = array(), $tagdata)
	{
		if(!$params)
		{
			$params = array();
		}
		
		$reserved = array(
			'total',
			'granularity',
			'width',
			'height',
			'file',
			'limit'
		);
		
		$default = array(
			'file'   	  => FALSE,
			'width'		  => FALSE,
			'pre_loop'	  => TRUE,
			'height'      => '14px',
			'limit'       => FALSE,
			'offset'      => 0,
			'total'       => config_item('photo_frame_save_colors'),
			'granularity' => config_item('photo_frame_save_color_granularity')
		);
		
		$params = array_merge($default, $params);		
		$photos = $this->_get_photos($this->field_id, $params['pre_loop']);
		
		if(!$params['limit'])
		{
			$params['limit'] = count($photos);
		}
		
		$this->EE->load->library('photo_frame_lib');
		
		$count = 0;
		
		$return = array();
		
		foreach($photos as $index => $photo)
		{
			if($count < $params['limit'] && $index >= $params['offset'])
			{
				$colors = $this->EE->photo_frame_model->get_colors(array(
					'where' => array(
						'photo_id' => $photo['id']
					)
				));
						
				if($colors->num_rows() > 0)
				{					
					$bars = $this->EE->photo_frame_lib->color_bars($colors->result(), $params['width'], $params['height']);
					
					if(!isset($params['class']))
					{
						$this->EE->TMPL->tagparams['class'] = 'color-bar';
					}
					
					$html_params = array();
					
					if(is_array($params))
					{
						foreach($params as $param => $value)
						{
							if(!in_array($param, $reserved) && !empty($value))
							{
								$html_params[] = $param.'="'.$value.'"';
							}
						}
					}
					
					$return[] = '<div '.implode(' ', $html_params).'>'.implode('', $bars).'</div>';
					$count++;
				}
			}
		}
		
		return implode('', $return);
	}
	
	public function replace_average_color($data, $params = array(), $tagdata)
	{		
		$this->EE->load->config('photo_frame_config');
		
		$default = array(
			'file'   	  => FALSE,
			'width'		  => FALSE,
			'height'      => '14px',
			'pre_loop'    => TRUE,
			'limit'       => FALSE,
			'type'        => 'rgb',
			'offset'      => 0,
			'total'       => config_item('photo_frame_save_colors'),
			'granularity' => config_item('photo_frame_save_color_granularity')
		);
		
		$params = array_merge($default, $params);		
		$photos = $this->_get_photos($this->field_id, $params['pre_loop']);
		
		if(!$params['limit'])
		{
			$params['limit'] = count($photos);
		}
		
		$this->EE->load->library('photo_frame_lib');
		
		$count = 0;
		
		$return = array();
		
		foreach($photos as $index => $photo)
		{
			if($count < $params['limit'] && $index >= $params['offset'])
			{
				$colors = $this->EE->photo_frame_model->get_colors(array(
					'where' => array(
						'photo_id' => $photo['id'],
						'average'  => 1
					)
				));
				
				if($colors->num_rows() == 0)
				{
					$file  = $this->EE->photo_frame_model->parse($photo['file'], 'server_path');
					
					if(file_exists($file))
					{
						$color = $this->EE->photo_frame_lib->get_average_color($file, $params['total'], $params['granularity']);
					}					
				}
				else
				{
					$color = $colors->row();
				}
				
				if(isset($color->r))
				{				
					$rgb = 'rgb('.$color->r.','.$color->g.','.$color->b.')';
					$hex = ImageEditor::rgb2hex($rgb);
				
					if(isset($$params['type']))
					{
						$return[] = $$params['type'];	
					}	
				}	
			}
		}
		
		return implode('', $return);
	}
	
	public function replace_total_photos($data, $params = array(), $tagdata)
	{		
		return count($this->_get_photos($this->field_id, isset($params['pre_loop']) ? $params['pre_loop'] : TRUE));
	}
	
	public function replace_first_photo($data, $params, $tagdata)
	{
		$total_photos = $this->replace_total_photos($data, $params, $tagdata);
		$offset       = isset($params['offset']) ? (int) $params['offset'] : 0;
		$limit   	  = isset($params['limit']) ? (int) $params['limit'] : 1;
		
		unset($params['offset']);
		
		$params['limit']  = $limit;
		$params['offset'] = 0 + $offset;
		
		if($params['offset'] >= $total_photos)
		{
			$params['offset'] = $total_photos - 1;
		}
		
		return $this->replace_tag($data, $params, $tagdata);
	}
	
	public function replace_last_photo($data, $params, $tagdata)
	{
		$total_photos = $this->replace_total_photos($data, $params, $tagdata);
		$offset 	  = isset($params['offset']) ? (int) $params['offset'] : 0;
		$limit   	  = isset($params['limit']) ? (int) $params['limit'] : 1;
		
		unset($params['offset']);
		
		$params['limit']  = $limit;
		$params['offset'] = $this->replace_total_photos($data, $params, $tagdata) - 1 - $offset;
		
		if($params['offset'])
		{
			$params['offset'] = 0;
		}
		
		return $this->replace_tag($data, $params, $tagdata);
	}
	
	public function display_var_tag($data, $params, $tagdata)
	{
		$this->row['entry_id'] = $data;
		$this->data[$data]     = $data;
		
		$this->low_variables = TRUE;
				
		$this->pre_loop($data);
		
		return $this->replace_tag($data, $params, $tagdata);
	}
	
	public function delete_var($var_id)
	{		
		$this->EE->load->model('photo_frame_model');
		
		$photos = $this->EE->photo_frame_model->get_photos(array(
			'where'  => array(
				'var_id' => $var_id
			)
		));
		
		foreach($photos->result() as $row)
		{
			$settings = $this->EE->photo_frame_model->get_settings($row->field_id, $row->col_id, $row->var_id);
			
			$this->EE->photo_frame_model->delete(array($row->id), $settings);
		}
	}
	
	public function replace_tag($data, $params = array(), $tagdata)
	{	
		if(isset($this->EE->session->cache['ep_better_workflow']) && $this->EE->session->cache['ep_better_workflow']['is_preview'])
		{
			$this->is_draft = TRUE;	
		}
		
		
		$this->EE->load->library('photo_frame_lib');
		$this->EE->load->config('photo_frame_config');
		
		if(!$params)
		{
			$params = array();	
		}
					
		$params = array_merge($this->default_params, $params);
		$params['offset'] = (int) $params['offset'];

		$photos = $this->_get_photos($this->field_id, $params['pre_loop'], $data);

		$return = array();
		
		$total_photos = 0;
		$photo_index  = 0;

		foreach($photos as $index => $row)
		{
			$index = count($return);

			if($params['offset'] <= $photo_index && (!$params['limit'] || $total_photos < $params['limit']))
			{	
				$row['thumb'] = $this->EE->photo_frame_model->parse($this->EE->photo_frame_lib->swap_filename($row['original_file_name'], $row['original_file'], '_thumbs/'), 'url');
								
				$row = $this->EE->photo_frame_lib->parse_vars($row, $this->upload_prefs, $params['directory']);
				
				if($this->is_draft)
				{
					$row['url'] .= ($this->is_draft ? '?__='.time() : '');
				}
				
				if(!empty($row['sizes']))
				{
					$sizes = json_decode($row['sizes']);
					
					if(isset($sizes->{$params['size']}))	
					{
						$row['file'] = $this->EE->photo_frame_model->parse($sizes->{$params['size']}->file, 'file');						
						$row['url']  = $this->EE->photo_frame_model->parse($sizes->{$params['size']}->file, 'url').($this->is_draft ? '?__='.time() : '');					
						$row['file_name'] = $this->EE->photo_frame_model->file_name($sizes->{$params['size']}->file);
					}
				}	
				
				if($tagdata)
				{							
					$return[$index] = $row;
					$return[$index]['count'] = $index + 1;
					$return[$index]['index'] = $index;
					$return[$index]['total_photos'] = count($photos);
					$return[$index]['is_first_photo'] = ($index == 0) ? TRUE : FALSE;
					$return[$index]['is_last_photo']  = ($index + 1 == $return[$index]['total_photos']) ? TRUE : FALSE;
					
					foreach($this->EE->photo_frame_lib->get_buttons() as $button)
					{
						$return[$index] = array_merge($return[$index], $button->parseVars($return[$index]));
					}
				}
				else
				{		
					$img = array(
						'src="'.$this->EE->photo_frame_model->parse((isset($params['directory']) && $params['directory'] ? $row[$params['directory']] : $row['url']), 'url').($this->is_draft ? '?__='.time() : '').'"'
					);
							
					if(empty($params['alt']))
					{
						$params['alt'] = !empty($row['title']) ? $row['title'] : (isset($this->row['title']) ? $this->row['title'] : NULL);
					}				
					
					foreach($params as $param => $value)
					{				
						if(!empty($value) && !in_array($param, $this->exclude_params))
						{
							$img[] = $param.'="'.$value.'"';
						}
					}
					
					$return[] = '<img '.implode(' ', $img).' />';
				}
				
				$total_photos++;
			}

			$photo_index++;
		}
		
		if($tagdata)
		{
			$return = $this->EE->channel_data->utility->add_prefix(isset($params['prefix']) ? $params['prefix'] : 'photo', $return);
		}
		else
		{
			return implode("\r\n", $return);
		}
		
		if(is_array($return))
		{
			return $this->parse($return, $tagdata);
		}
	}
	
	private function _parse_filenames()
	{
		var_dump($this->upload_prefs);exit();
	}
	
	public function setting($index, $default = FALSE)
	{
		$index = 'photo_frame_'.$index;
		
		if(isset($this->settings[$index]))
		{
			return !empty($this->settings[$index]) ? $this->settings[$index] : $default;
		}
		
		return $default;
	}
	
	public function save_cell($data)
	{
		$this->matrix = TRUE;
		
		$this->save($data);
		
		//unset($this->EE);

		if(isset($this->settings['entry_id']))
		{
			return $this->settings['entry_id'];
		}

		return TRUE;
	}
	
	public function save_var_field($data)
	{
		$this->low_variables = TRUE;
		
		$this->save($data);
		
		return $this->var_id;
	}
	
	
	public function grid_save_field($data)
	{
		$this->grid = TRUE;
		
		$this->save($data);
		
		return $this->grid_id;
	}
	
	public function save($data)
	{
		$this->EE->load->library('photo_frame_lib');
		
		$this->_delete_photos();
		
		if(is_string($data) && preg_match("/({filedir_\d})(.*\.\w*)/us", $data, $matches))
		{
			$frame_file = $matches[1].config_item('photo_frame_directory_name').'/'.$matches[2];
			
			$orig_file   = $this->EE->photo_frame_model->parse($data, 'server_path');			
			$framed_file = $this->EE->photo_frame_model->parse($frame_file, 'server_path');
					
			$post_data = array(
				array('new' => json_encode(array(
					'original_file' => $data,
					'file'          => $frame_file,
					'file_name'     => $matches[2],
					'title'         => '',
					'description'   => '',
					'manipulations' => '',
					'keywords'      => '',
					'x'				=> '',
					'x2'			=> '',
					'y' 			=> '',
					'y2' 			=> '',
					'height'	    => ImageEditor::width($orig_file),
					'width'		    => ImageEditor::height($orig_file)
					
				))
			));
			
			if($this->matrix)
			{
				$_POST[$this->settings['field_name']][$this->settings['row_name']][$this->settings['col_name']] = $post_data;
			}
			else
			{
				$_POST[$this->field_name] = $post_data;
			}
			
			ImageEditor::init($orig_file)->duplicate($framed_file);
		}
		
		return NULL;
	}
	
	public function draft_publish()
	{
		$this->EE->session->set_cache('ep_better_workflow', 'is_publish', TRUE);
	}
	
	public function draft_discard()
	{
		$this->EE->load->model('photo_frame_model');
		
		$photos = $this->EE->photo_frame_model->get_photos(array(
			'where' => array(
				'field_id' => $this->settings['field_id'],
				'entry_id' => $this->settings['entry_id'],
				'is_draft' => 1
			)
		));
		
		foreach($photos->result() as $photo)
		{
			$this->EE->photo_frame_model->delete($photo->id, $this->settings);
		}
	}

	public function draft_save($data, $draft_action)
	{
		$this->is_draft = TRUE;
		
		$this->EE->load->model('photo_frame_model');
		$this->EE->load->helper('string');
		
		$this->field_id = $this->settings['field_id'];
		
		$post = $this->EE->input->post('field_id_'.$this->field_id);
		
		/*
		$post_data = array();
		$new_data  = array();
		
		foreach($post as $index => $data)
		{
			foreach($data as $type => $value)
			{
				$value = json_decode($value);
				$post_data[$value->id] = $value;
			}
		}
		*/
		
		$orig_data   = $data;		
		$invalid_ids = array();
				
		foreach($post as $index => $photo)
		{	
			if(isset($photo['edit']))
			{
				$photo = (array) json_decode($photo['edit']);
				
				if(!$this->EE->photo_frame_model->has_draft($photo['id'], $this->settings))
				{	
					$photo_row = $this->EE->photo_frame_model->get_photo($photo['id'])->row_array();
					
					$settings  = $this->EE->photo_frame_model->get_settings($this->field_id, $this->col_id);
						
					$photo['is_draft'] = 1;
					$photo['live_id']  = $photo_row['id'];
						
					$photo_row = array_merge($photo_row, $photo);
					
					$photo_row['manipulations'] = is_object($photo['manipulations']) ? json_encode($photo['manipulations']) : $photo['manipulations'];
					
					//$directory  = str_replace($photo_row['file_name'], '', $photo_row['file']);			
					//$filename   = random_string();
					//$extension  = $this->EE->photo_frame_lib->extension($photo_row['file_name']);
					
					$live_path = $this->EE->photo_frame_model->parse($photo_row['file'], 'server_path');
					$live_url  = $this->EE->photo_frame_model->parse($photo_row['file'], 'url');	
									
					$rename_photo = $this->EE->photo_frame_lib->rename($photo_row, $settings, TRUE);				
					$new_filename = $this->EE->photo_frame_lib->parse($rename_photo, $settings['photo_frame_name_format']);
					
					$photo_row['file'] 		= str_replace($photo_row['file_name'], $new_filename, $photo_row['file']);
					$photo_row['file_name'] = str_replace($photo_row['file_name'], $new_filename, $photo_row['file_name']);
					
					$draft_path   = $this->EE->photo_frame_model->parse($photo_row['file'], 'server_path');		
					$draft_url    = $this->EE->photo_frame_model->parse($photo_row['file'], 'url');
					
					copy(isset($photo_row['cachePath']) ? $photo_row['cachePath'] : $live_path, $draft_path);
					
					unset($photo_row['cacheUrl']);
					unset($photo_row['cachePath']);
					
					$photo_id = $this->EE->photo_frame_model->insert($photo_row);
					
					$photo_row['id'] = $photo_id;
					
					$photo_row = $this->_unset($photo_row);
			
					$data[$index]['edit'] = json_encode($photo_row);					
					
					$this->EE->photo_frame_model->duplicate_photo_colors($photo['id'], $photo_id);
				}
				
				$invalid_ids[] = isset($photo_row['id']) ? $photo_row['id'] : $photo['id'];
			}
		}
		
		if(isset($_POST['photo_frame_delete_photos']))
		{						
			foreach($_POST['photo_frame_delete_photos'][$this->field_id] as $index => $value)
			{
				$photo_row = $this->EE->photo_frame_model->get_photo($value)->row_array();
						
				if(in_array($value, $invalid_ids) || !$photo_row['is_draft'])
				{
					unset($_POST['photo_frame_delete_photos'][$this->field_id][$index]);
				}
			}
			
			$this->_delete_photos(true);
		}
		
		$this->post_save($data);
	}
	
	public function grid_post_save($data)
	{
		$this->grid = TRUE;
		
		$this->post_save($data);
	}
	
	public function post_save_cell($data)
	{
		$this->matrix = TRUE;

		$this->post_save($data);
	}
	
	public function post_save_var($data)
	{
		$this->low_variables = TRUE;

		$this->post_save($data);	
	}
	
	public function post_save($data)
	{	
		$this->EE->load->library('photo_frame_lib');
		
		if($this->matrix || $this->low_variables)
		{
			$settings = $this->settings;
		}
		else if($this->low_variables)
		{
			$settings = $this->settings;
		}
		else if($this->grid)
		{
			$settings = $this->settings;
		}
		else
		{
			$settings = unserialize(base64_decode($this->settings['field_settings']));
		}
		
		$new_photos  = array();
		$edit_photos = array();		
		$photo_names = array();
			
		if(!$this->is_draft)
		{
    		$post = $this->_get_post();
		}
		else
		{
			$post = $data;
		}
		
		$buttons = $this->EE->photo_frame_lib->get_buttons();
		
		if(is_array($post))
		{
    		foreach($post as $index => $photo)
    		{
    		    if(isset($photo['new']))
    		    {
        		    $photo = (array) json_decode($photo['new']);
        		  
        		   	$path  = $this->EE->photo_frame_model->parse($photo['file'], 'server_path');
        		   	
        		   	if(isset($photo['cachePath']))
        		   	{
        		   		copy($photo['cachePath'], $path);
        		   	}
        		   	
        		   	if(isset($this->settings['entry_id']))
        		   	{			
						$entry = $this->EE->channel_data->get_entry($this->settings['entry_id'])->row();
					}
					else
					{
						$this->settings['entry_id'] = NULL;
					}
					
					$photo_names[] = $photo['file_name'];
					
        		    $photo['original_file_name'] = $photo['file_name'];
        		    $photo['site_id']    		 = config_item('site_id');
    				$photo['field_id']   		 = $this->field_id;
    			    $photo['order']      		 = $index;
    				$photo['entry_id']   		 = $this->settings['entry_id'];
    				$photo['channel_id'] 		 = isset($entry->channel_id) ? $entry->channel_id : NULL;
    				$photo['manipulations'] 	 = json_encode($photo['manipulations']);
    				$photo['is_draft']			 = $this->is_draft ? 1 : 0;
    				
    				if(isset($this->settings['col_id']))
    				{
	    				$photo['col_id'] = $this->settings['col_id'];
    				}
    				
    				if(isset($this->settings['row_id']))
    				{
	    				$photo['row_id'] = $this->settings['row_id'];
    				}
    				
    				if(isset($this->var_id))
    				{
	    				$photo['var_id'] = $this->var_id;	
    				}
    				
    				$average_color = (array) $this->EE->photo_frame_lib->get_average_color($photo['file'], config_item('photo_frame_save_colors'), config_item('photo_frame_save_color_granularity'));
    				$average_color['average'] = 1;
    				
    				$colors = $this->EE->photo_frame_lib->get_colors($photo['file'], config_item('photo_frame_save_colors'), config_item('photo_frame_save_color_granularity'));				
    				$colors = array_merge($colors, array((object) $average_color)); 
    				  	
    				if($photo['asset_id'])
    				{
    					$photo['original_file'] = $this->EE->photo_frame_lib->replace_asset_subdir($photo['asset_id'], $photo['original_file']);
    				}
    				
    				$photo  = (array) $this->EE->photo_frame_lib->rename($photo, $settings);
    				
    				//$photo['original_file'] = $orig_file;
    				
    				$photo['colors'] = $colors;
    				
    				$orig_photo = $photo;
    				
    				$photo = $this->_unset($photo);
    				
    				foreach($buttons as $button)
    				{
	    				$photo = (array) $button->postSave((array) $photo, $orig_photo);
    				}
    				
    				$new_photos[] = $photo;
    		    }
    		    
    		    if(isset($photo['edit']) && count($photo['edit']))
    		    {
        		    $photo = json_decode($photo['edit']);

        		   	if(is_object($photo))
        		   	{    
        		   		$existing_photo = $this->EE->photo_frame_model->get_photo($photo->id);
        		   		
        		   		if($existing_photo->num_rows() == 0)
        		   		{
	        		   		continue;
        		   		}
        		   		
        		   		$existing_photo = $existing_photo->row();
        		   		$existing_manip = json_decode($existing_photo->manipulations);
        		   		
        		   		$compare = $photo->manipulations;
        		   		$compare = is_string($photo->manipulations) ? json_decode($photo->manipulations) : $photo->manipulations;
        		   		
        		   		if(isset($photo->cachePath))
        		   		{
	        		   		$path = $this->EE->photo_frame_model->parse($photo->file, 'server_path');
	        		   		
	        		   		copy($photo->cachePath, $path);
	        		   		
	        		   		unset($photo->cachePath);
	        		   		unset($photo->cacheUrl);
        		   		}
        		   		
        		   		// var_dump($this->EE->photo_frame_lib->needs_manipulation($compare, $existing_manip));exit();

        		   		if($this->EE->photo_frame_lib->needs_manipulation($compare, $existing_manip))
        		   		{	
		    				$average_color = (array) $this->EE->photo_frame_lib->get_average_color($photo->file, config_item('photo_frame_save_colors'), config_item('photo_frame_save_color_granularity'));
		    				$average_color['average'] = 1;
		    				
		    				$colors = $this->EE->photo_frame_lib->get_colors($photo->file, config_item('photo_frame_save_colors'), config_item('photo_frame_save_color_granularity'));
		    							
		    				$colors = array_merge($colors, array((object) $average_color));    
		    				
		    				$this->EE->photo_frame_model->insert_colors($colors, $photo->id, array(
		    					'site_id'  => config_item('site_id'),
		    					'field_id' => $this->field_id,
		    					'entry_id' => isset($this->settings['entry_id']) ? $this->settings['entry_id'] : '',
		    					'date'	   => date('Y-m-d H:i:s', time()),
		    					'row_id'   => isset($this->settings['row_id']) ? $this->settings['row_id'] : '',
		    					'col_id'   => isset($this->settings['col_id']) ? $this->settings['col_id'] : '',
		    					'var_id'   => isset($this->var_id) ? $this->var_id : ''
		    				));
        		   		}
        		   		
						$photo_names[] = $photo->file_name;
						
	        		    if($this->matrix)
	        		    {
		        		    $photo->col_id = $this->settings['col_id'];
	        		    }
	        		    
	        		    //$photo->is_draft = $this->is_draft ? 1 : 0;        		   	
	        		    $photo->order    = $index;  
	        		    
	        		    $orig_photo = $photo;
	    				$photo 		= $this->_unset($photo);
    				
	    				foreach($buttons as $button)
	    				{
		    				$photo = (object) $button->postSave((array) $photo, (array) $orig_photo);
	    				}
	    				
	        		    if(!is_string($photo->manipulations))
	        		    {        		
	    					$photo->manipulations = json_encode($photo->manipulations);
	        		    }

	        		    $edit_photos[] = $photo;
        		    }
    		    }
    		}
		}

		if(count($new_photos) > 0)
		{   
			$this->EE->photo_frame_model->save($new_photos);
		}
		
		if(count($edit_photos) > 0)
		{    		
			$this->EE->photo_frame_model->update($edit_photos, $this->matrix);
		}
		
		if($this->matrix)
		{	
			$row_id = $this->settings['row_id'];
			$col_id = $this->settings['col_id'];

			$this->EE->photo_frame_model->update_cell($this->settings['row_id'], array(
				'col_id_'.$col_id => $this->settings['row_id']
			));			
		}
		else
		{
			if(!$this->low_variables)
			{
				if(!$this->grid)
				{
					$this->EE->photo_frame_model->update_entry($this->settings['entry_id'], array(
						'field_id_'.$this->field_id => $this->settings['entry_id']
					));
				}
				else
				{
					$this->EE->photo_frame_model->update_grid(
						$this->settings['grid_field_id'], 
						$this->settings['grid_row_id'], 
						array(
							'col_id_'.$this->settings['col_id'] => $this->settings['grid_row_id']
						)
					);
				}	
								
				if($this->is_draft)
				{
					$this->EE->photo_frame_model->update_draft_data($this->settings['entry_id'], $this->field_id);
				}
				
				$var_id = NULL;			
			}
			else
			{
				$var_id = $this->var_id;
			}
		}
		
		if(!isset($this->settings['entry_id']))
		{
			$this->settings['entry_id'] = NULL;
		}
		
		if(!isset($col_id))
		{
			$col_id = NULL;
		}
				
		if(!isset($row_id))
		{
			$row_id = NULL;
		}	
		
		if(!isset($var_id))
		{
			$var_id = NULL;
		}
		
		$this->EE->photo_frame_lib->resize_photos($this->field_id, $this->settings['entry_id'], $col_id, $row_id, $var_id, $settings, $this->matrix);
			
		if(isset($this->EE->session->cache['ep_better_workflow']['is_publish']) && $this->EE->session->cache['ep_better_workflow']['is_publish'] == TRUE)
		{
			$live_photos = $this->EE->photo_frame_model->get_photos(array(
				'select' => 'photo_frame.id', 
				'where'  => array(
					'entry_id' => $this->settings['entry_id'],
					'field_id' => $this->field_id,
					'is_draft' => 0
				)
			))->result_array();
			$live_photos = $this->EE->channel_data->utility->reindex('id', $live_photos);
			
			$draft_photos = $this->EE->photo_frame_model->get_photos(array(
				'where' => array(
					'entry_id' => $this->settings['entry_id'],
					'field_id' => $this->field_id,
					'is_draft' => 1
				)
			));
			
			$update = array();
			
			foreach($draft_photos->result_array() as $photo)
			{
				$orig_id = array($photo['id']);
				$id      = $photo['live_id'];
				
				unset($live_photos[$id]);
				
				$photo['is_draft'] = 0;
				$photo['live_id']  = NULL;
				
				unset($photo['id']);
				
				if(!empty($id))
				{
					$this->EE->photo_frame_model->update_photo($id, $photo);
				}
				else
				{
					$this->EE->photo_frame_model->insert($photo);
				}
				
				$this->EE->photo_frame_model->delete($orig_id, $this->settings);					
			}
			
			$delete_photos = array();
			
			foreach($live_photos as $photo)
			{
				$delete_photos[] = $photo['id'];
			}
			
			$this->EE->photo_frame_model->delete($delete_photos, $this->settings);
		}
		
		return $this->low_variables ? $this->var_id : $this->settings['entry_id'];
	}	

	public function validate_cell($data)
	{		
		$this->matrix = TRUE;
		
		return $this->validate($data);
	}
	
	public function grid_validate($data)
	{		
		$this->grid = TRUE;
		
		return $this->validate($data);
	}
	
	public function validate($data)
	{
		$post_data = NULL;
		
		if($this->safecracker)
		{
			if(isset($_POST[$this->settings['field_name']]))
			{			
				foreach($_POST[$this->settings['field_name']] as $index => $post)
				{
					unset($_POST[$this->settings['field_name']][$index]['placeholder']);
					
					if(count($_POST[$this->settings['field_name']][$index]) == 0)
					{
						unset($_POST[$this->settings['field_name']][$index]);
					}
				}
			}
		}
		if($this->matrix)
		{
			if(isset($_POST[$this->settings['field_name']][$this->settings['row_name']][$this->settings['col_name']]))
			{
				$post_data = $_POST[$this->settings['field_name']][$this->settings['row_name']][$this->settings['col_name']];
			}
		}
		elseif(isset($_POST[$this->field_name]))
		{
			$post_data = $_POST[$this->field_name];	
		}
			
		$this->EE->load->library('photo_frame_lib');
				
		$min_photos    = isset($this->settings['photo_frame_min_photos']) ? (int) $this->settings['photo_frame_min_photos'] : 0;
		$max_photos    = isset($this->settings['photo_frame_max_photos']) ? (int) $this->settings['photo_frame_max_photos'] : 0;
		$total_photos  = isset($post_data) && !is_null($post_data) ? TRUE : 0;
		
		if($total_photos === TRUE)
		{
			$total_photos = 0;
			
			foreach($post_data as $index => $photo)
			{
				if(isset($photo['new']) || isset($photo['edit']))
				{
					$total_photos++;
				}
			}
		}
		
		// Required for Safecracker validation
		if(isset($this->settings['field_required']) && $this->settings['field_required'] == 'y')
		{
			if(!$total_photos)
			{
				return $this->parse_variables(lang('photo_frame_required'), array('field_name' => $this->settings['field_label']));
			}
		}
		
		$this->_delete_photos();
		
		$vars = array(
			'min_photos' 	  => $min_photos,
			'max_photos'      => $max_photos,
			'max_photos_name' => $max_photos > 1 || $max_photos < 1 ? 'photos' : 'photo',
			'min_photos_name' => $min_photos > 1 || $min_photos < 1 ? 'photos' : 'photo'
		);
		
		if($min_photos > 0 && $min_photos > $total_photos)
		{
			$error = $this->parse_variables(lang('photo_frame_min_photos_error'), $vars);
		}
		
		if($max_photos > 0 && $max_photos < $total_photos)
		{
			$error = $this->parse_variables(lang('photo_frame_max_photos_error'), $vars);
		}
		
		if(isset($error))
		{
			return $error;	
		}
		
		return TRUE;
	}
	
	private function _delete_photos($force_delete = FALSE)
	{	
		$post_photos = $this->EE->input->post('photo_frame_delete_photos', TRUE);

		$id = $this->low_variables ? $this->var_id : ($this->grid || $this->matrix ? $this->settings['col_id'] : $this->settings['field_id']);
		
		if(!$this->EE->input->post('epBwfDraft_create_draft') && !$this->EE->input->post('epBwfDraft_update_draft') || $force_delete)
		{		
			if(isset($post_photos[$id]))
			{
				$delete_photos = $post_photos[$id];
					
				unset($post_photos[$id]);
							
				// $total_photos  = $total_photos - count($delete_photos);
				
				$this->EE->photo_frame_model->delete($delete_photos, $this->settings, $this->is_draft);
				
				$_POST['photo_frame_delete_photos'] = $post_photos;
			}
		}
		else
		{
			if(isset($post_photos[$id]))
			{
				foreach($post_photos[$id] as $photo_id)
				{
					$_POST[$this->field_name][]['delete'] = $photo_id;
				}
			}
		}
	}
	
	public function parse_variables($str, $vars = array())
	{
		foreach($vars as $var => $value)
		{
			$str = preg_replace('/'.LD.'('.$var.')'.RD.'/', $value, $str);
		}
		
		return $str;
	}
	
	public function display_var_settings($data)
	{
		$this->low_variables = TRUE;
				
		return $this->display_settings($data);
	}
	
	public function grid_display_settings($data)
	{
		$this->grid = TRUE;
		
		$settings = $this->display_settings($data);
		
	    return array(
	        $this->grid_field_formatting_row($data),
	        $this->grid_text_direction_row($data),
	        $this->grid_max_length_row($data),
	        $settings
	    );
	}
	
	public function grid_settings_modify_column($data)
	{
		return $data;
	}

	public function display_settings($data)
	{
		$this->EE->load->config('photo_frame_config');
		$this->EE->load->library('photo_frame_lib');
		
		$assets_installed = $this->EE->photo_frame_lib->assets_installed();		
		
		$themes = array('' => 'Default');
		
		foreach($this->EE->photo_frame_lib->get_themes() as $name => $theme)
		{
		    $themes[$name] = $theme->getTitle();
		}
			
		require PATH_THIRD . 'photo_frame/libraries/InterfaceBuilder/InterfaceBuilder.php';
		
		$this->EE->theme_loader->module_name = 'photo_frame';
		$this->EE->theme_loader->javascript('InterfaceBuilder');
		
		if($this->matrix)
		{
			$this->EE->theme_loader->output('
				var IB;
				
				$(".matrix-first select").change(function() {
					if($(this).val() == "photo_frame") {
						IB = new InterfaceBuilder();
					}
				});
			');
		}
		else
		{
			$this->EE->theme_loader->output('
				var IB = new InterfaceBuilder();
			');
		}
		
		$settings = array();
		
		$resize_fields = array(
			'photo_frame_upload_group' => array(
				'label'       => 'File Upload Group',
				'description' => 'Select the file upload group you in which you want to store your photos.',
				'type'        => 'select',
				'settings' => array(
					'options' => $this->EE->photo_frame_model->upload_options()
				)
			),
			'photo_frame_folder_id' => array(
				'label'       => 'Assets Folder',
				'description' => 'Select the Asset\'s folder you in which you want to store your photos.',
				'type'        => 'select',
				'settings' => array(
					'options' => $this->EE->photo_frame_model->asset_folders()
				)
			),
			'photo_frame_delete_files' => array(
				'label'       => 'Delete Files',
				'description' => 'Do you want to delete the files stored on the server when users delete photos within the entries? If this setting is set to False, then the files will always remain on the server.',
				'type'        => 'select',
				'settings' => array(
					'options' => array(
						'false' => 'False',
						'true'  => 'True',
					)
				)
			),
			'photo_frame_jpeg_compression' => array(
				'label'       => 'Image Compression (JPEG Only)',
				'description' => 'Enter an integer 1-100 with 100 being the best quality.',
				'type'        => 'input'
			),
			'photo_frame_resize_max_width' => array(
				'label'       => 'Resize Uploaded Photo (Max Width)',
				'description' => 'If the uploaded photo\'s width is greater than its height and is greater than the defined value, it will be scaled down to the defined width <i>before</i> it is uploaded.',
				'type'        => 'input'
			),
			'photo_frame_resize_max_height' => array(
				'label'       => 'Resize Uploaded Photo (Max Height)',
				'description' => 'If the uploaded photo\'s height is greater than its width and is greater than the defined value, it will be scaled down to the defined height <i>before</i> it is uploaded.',
				'type'        => 'input'
			),
			'photo_frame_cropped_sizes' => array(
				'label'       => 'Resize Cropped Photo Sizes',
				'description' => 'Resize the cropped photos to the defined sizes by defining a name, height, and width. Note, if multiple sizes are defined, then multiple images will be created. If a width or height isn\' set, then the image will be scaled to the defined dimension.',
				'type'        => 'matrix',
				'settings' => array(
					'columns' => array(
						0 => array(
							'name'  => 'name',
							'title' => 'Name'
						),
						1 => array(
							'name'  => 'width',
							'title' => 'Width'	
						),
						2 => array(
							'name'  => 'height',
							'title' => 'Height'
						),
					),
					'attributes' => array(
						'class'       => 'mainTable padTable',
						'border'      => 0,
						'cellpadding' => 0,
						'cellspacing' => 0
					)
				)			
			),
			'photo_frame_name_format' => array(
				'label'       => 'Filename Format',
				'description' => 'If a format is defined, the variables will be parsed to create a dynamic filename which will override the default.<br><br>Available Variables: <i>{channel_id}, {entry_id}, {title}, {url_title}, {filename}, {extension}, {name}, {width}, {height}, {random_alpha}, {random_alnum}, {random_numeric}, {random_string}, {random_nozero}, {random_unique}, {random_sha1}</i>',
				'type'        => 'input'
			)
		);
		
		$crop_fields = array(			
			'photo_frame_min_photos' => array(
				'label'       => 'Minimum Number of Photos',
				'description' => 'If defined, you can mandate a minimum number of photos that a user must upload. If no minimum is desired, use the default value of <i>0</i>.',
				'type'        => 'input'
			),
			'photo_frame_max_photos' => array(
				'label'       => 'Maximum Number of Photos',
				'description' => 'If defined, you can mandate a maxmimum number of photos that a user can upload. If no maximum is desired, use the default value of <i>0</i>.',
				'type'        => 'input'
			),
			/*
			'photo_frame_preview_width' => array(
				'label' => 'Preview Width',
				'description' => ''
			),
			'photo_frame_preview_height' => array(
				'label' => 'Preview Height',
				'description' => ''
			),
			*/
			'photo_frame_min_width' => array(
				'label' => 'Photo Min Width',
				'description' => 'Values should be numerical and in pixels.'
			),
			'photo_frame_min_height' => array(
				'label' => 'Photo Min Height',
				'description' => 'Values should be numerical and in pixels.'
			),
			'photo_frame_max_width' => array(
				'label' => 'Photo Max Width',
				'description' => 'Values should be numerical and in pixels.'
			),
			'photo_frame_max_height' => array(
				'label' => 'Photo Max Height',
				'description' => 'Values should be numerical and in pixels.'
			),
			'photo_frame_max_size' => array(
				'label'       => 'Maximum File Size (MB)',
				'description' => 'Enter a maximum file size you wish to accept. If no size if defined any size will be accepted. This value should be numeric and is measured in Megabytes.'
			),
			'photo_frame_aspect_ratio' => array(
				'label'       => 'Photo Aspect Ratio',
				'description' => 'Enter any desired aspected ration like: 1:1, 1:2, or 4:3. Aspect ratios are <i>width:height</i>'
			),
			'photo_frame_default_location' => array(
				'label' 	  => 'Default Crop Location',
				'description' => 'There should be four coordinates, each represented in pixels which place each corner of the crop utility. If left blank, the crop utility will not display by default. <i>Format: x1, y1, x2, y2</i>'
			),
			'photo_frame_default_size' => array(
				'label' 	  => 'Default Crop Size',
				'description' => 'Define a default height and width that will be used to center the crop utility within the photo. Ex: <i>400x300</i>',
			)
		);
		
		$info_fields = array(
			'photo_frame_cp_theme' => array(
				'label'       => 'Control Panel Theme',
				'description' => 'If you want change the default theme, select one from the list.',
				'type'        => 'select',
				'settings' => array(
					'options' => $themes
				)
			)
		);
		
		if($assets_installed)
		{
			$info_fields['photo_frame_assets'] = array(
				'label'       => 'Enable Assets Browsing?',
				'description' => 'If you want have Pixel & Tonic\'s Assets installed, you can use it to browse the existing assets. Photo Frame will make a copy of the asset and use it to create a new framed photo for you to crop.',
				'type'        => 'select',
				'settings' => array(
					'options' => array(
						'true'  => 'True',
						'false' => 'False'
					)
				)
			);
			
			$info_fields['photo_frame_assets_safecracker'] = array(
				'label'       => 'Display Assets Browser in Safecracker?',
				'description' => 'If you want use Pixel & Tonic\'s Assets assets in safecracker, set this option to "True".',
				'type'        => 'select',
				'settings' => array(
					'options' => array(
						'true'  => 'True',
						'false' => 'False'
					)
				)
			);
		}
		
		$info_fields = array_merge($info_fields, array(
			'photo_frame_file_upload' => array(
				'label'       => 'Show File Upload Button?',
				'description' => 'If you want to display the upload button, set this option to "True".',
				'type'        => 'select',
				'settings' => array(
					'options' => array(
						'true'  => 'True',
						'false' => 'False'
					)
				)
			),
			'photo_frame_file_browser' => array(
				'label'       => 'Show File Browser Button?',
				'description' => 'If you want to display the file browser button, set this option to "True".',
				'type'        => 'select',
				'settings' => array(
					'options' => array(
						'true'  => 'True',
						'false' => 'False'
					)
				)
			),
			'photo_frame_force_crop' => array(
				'label'       => 'Force Users to Crop Photos?',
				'description' => 'If you want to force users to crop the photo, or at least always see the crop utility then set this to "True". If you set this to "False" then the photo will be uploaded and the user will have to edit the photo to crop it.',
				'type'        => 'select',
				'settings' => array(
					'options' => array(
						'true'  => 'True',
						'false' => 'False'
					)
				)
			),
			'photo_frame_disable_crop' => array(
				'label'       => 'Disable Photo Cropping?',
				'description' => 'If "True", the user will have the ability to manually crop the photo. If you want to disable manual photo cropping set this to option to "False".',
				'type'        => 'select',
				'settings' => array(
					'options' => array(
						'false' => 'False',
						'true'  => 'True'
					)
				)
			),
			'photo_frame_show_editor_cp' => array(
				'label'       => 'Use editor in Control Panel?',
				'description' => 'If "True", users will be able to use the photo editor in the control panel.',
				'type'        => 'select',
				'settings' => array(
					'options' => array(
						'true'  => 'True',
						'false' => 'False',
					)
				)
			),
			'photo_frame_show_editor_sc' => array(
				'label'       => 'Use editor in Safecracker?',
				'description' => 'If "True", users will be able to use the photo editor on the front-end (using Safecracker).',
				'type'        => 'select',
				'settings' => array(
					'options' => array(
						'true'  => 'True',
						'false' => 'False',
					)
				)
			),
			'photo_frame_show_editor_mx' => array(
				'label'       => 'Use editor in Matrix?',
				'description' => 'If "True", users will be able to use the photo editor within Matrix fields.',
				'type'        => 'select',
				'settings' => array(
					'options' => array(
						'true'  => 'True',
						'false' => 'False',
					)
				)
			),
			'photo_frame_drop_zone' => array(
				'label'       => 'Enable Drag/Drop Uploads?',
				'description' => 'If you want to allow photos to be uploaded using drag and drop, set this option to "True".',
				'type'        => 'select',
				'settings' => array(
					'options' => array(
						'true'  => 'True',
						'false' => 'False'
					)
				)
			),
			'photo_frame_sortable' => array(
				'label'       => 'Enable Photo Sorting',
				'description' => 'If you want to disallow the user to reorder the photos with drag and drop, set this option to "True".',
				'type'        => 'select',
				'settings' => array(
					'options' => array(
						'true'  => 'True',
						'false' => 'False'
					)
				)
			),
			'photo_frame_display_meta' => array(
				'label'       => 'Display Meta on Save',
				'description' => 'If you want the meta dialog will always prompt the user before the photo is saved, set this option to "True".',
				'type'        => 'select',
				'settings' => array(
					'options' => array(
						'false' => 'False',
						'true'  => 'True',
					)
				)
			),
			'photo_frame_display_info' => array(
				'label'       => 'Display Info Panel',
				'description' => 'If you want to display coordinates, image size, and aspect ratio, set this option to "True".',
				'type'        => 'select',
				'settings' => array(
					'options' => array(
						'false' => 'False',
						'true'  => 'True',
					)
				)
			),
			'photo_frame_button_text' => array(
				'label' 	  => 'Upload Button Text',
				'description' => 'Override the default upload button text. If no value is present the default text will be used.'
			),
			'photo_frame_browse_button_text' => array(
				'label' 	  => 'Browse Button Text',
				'description' => 'Override the default browse button text. If no value is present the default text will be used.'
			),
			'photo_frame_instructions' => array(
				'label' 	  => 'Instructions',
				'description' => 'Override the default instruction text. If no value is present the default instructions will be used.',
				'type'		  => 'textarea',
			),
			'photo_frame_upload_helper' => array(
				'label' 	  => 'Upload Helper',
				'description' => 'You have add additional instructions below the upload button to instruct users about file types and/or sizes (for example). Otherwise, use this field as you wish.',
				'type'		  => 'textarea',
			)
		));
		
		if($this->low_variables)
		{
			$return = array();
			
			foreach(array_merge($resize_fields, $crop_fields, $info_fields) as $field_name => $field)
			{
				unset($this->EE);
				
				$return[] = array(
					$field['label'],
					InterfaceBuilder::field($field_name, $field, $data, array(
						'dataArray' => TRUE,
						'varName'  => 'variable_settings[photo_frame]'
					))->display_field()
				);
			}
			
			return $return;
		}
		
		$vars = array(
			'matrix' 	   => $this->matrix,
			'resize_table' => InterfaceBuilder::table($resize_fields, $data, array(), array(
				'class'       => $this->matrix ? 'matrix-col-settings' : 'mainTable padTable',
				'border'      => 0,
				'cellpadding' => 0,
				'cellspacing' => 0
			)),
			'crop_table' => InterfaceBuilder::table($crop_fields, $data, array(), array(
				'class'       => $this->matrix ? 'matrix-col-settings' : 'mainTable padTable',
				'border'      => 0,
				'cellpadding' => 0,
				'cellspacing' => 0
			)),
			'info_table' => InterfaceBuilder::table($info_fields, $data, array(), array(
				'class'       => $this->matrix ? 'matrix-col-settings' : 'mainTable padTable',
				'border'      => 0,
				'cellpadding' => 0,
				'cellspacing' => 0
			))
		);
		
		return $this->EE->load->view('settings', $vars, TRUE);
	}
	
	public function delete_rows($row_ids)
	{
		$this->EE->load->model('photo_frame_model');
		
		foreach($row_ids as $index => $row_id)
		{
			unset($row_ids[$index]);
			
			$row_ids[$index] = 'or '.$row_id;	
		}
		
		$photos = $this->EE->photo_frame_model->get_photos(array(
			'where'  => array(
				'row_id' => $row_ids
			)
		));
		
		foreach($photos->result() as $row)
		{
			$settings = $this->EE->photo_frame_model->get_settings($row->field_id, $row->col_id);
			
			$this->EE->photo_frame_model->delete(array($row->id), $settings);
		}
	}
	
	public function delete($ids)
	{
		$this->EE->load->library('photo_frame_lib');
		
		$this->EE->photo_frame_model->delete_entries($ids);
	}
	
	/**
	 * Saves the settings
	 *
	 * @access	public
	 * @param 	array
	 * @return	array
	 */
	 
	function save_settings($data)
	{
		return $data;
	}
	
	
	private function bool_param($param)
	{
		$param = strtolower($param);
		
		if(preg_match('/true|t|yes|y|1/', $param) || $param === TRUE)
		{
			return TRUE;
		}
		
		return FALSE;
	}
	
	private function _get_post()
	{
		if($this->matrix)
		{
			if (!empty($this->var_id))
 			{
 				$post = $this->EE->input->post('var', TRUE);
 				$post = $post[$this->var_id];
 			}
 			else
 			{
 				$post = $this->EE->input->post($this->settings['field_name'], TRUE);
 			}

			if(isset($post[$this->settings['row_name']][$this->settings['col_name']]))
			{
				$post = $post[$this->settings['row_name']][$this->settings['col_name']];
			}
			else
			{
				$post = array();
			}
		}
		else
		{
			if(!$this->low_variables)
			{
				$post = $this->EE->input->post($this->field_name, TRUE);
			}
			else
			{
				$post = $this->EE->input->post('var', TRUE);				
				$post = $post[$this->var_id];
			}
			
		}
		
		return $post;
	}
	
	private function parse($vars, $tagdata = FALSE)
	{
		if($tagdata === FALSE)
		{
			$tagdata = $this->EE->TMPL->tagdata;
		}
			
		return $this->EE->TMPL->parse_variables($tagdata, $vars);
	} 
	
	private function _unset($photo)
	{		
		$unset = array(
			'channel_id' => FALSE,
			'cachePath'  => FALSE,
			'cacheUrl'   => FALSE,
			'directory'  => FALSE,
			'exif_data'  => FALSE,
			'new'        => FALSE,
			'id'
		);
		
		$is_object = FALSE;
		
		if(is_object($photo))
		{
			$is_object = TRUE;
			
			$photo = (array) $photo;
		}
		
		foreach($unset as $var => $rename)
		{
			if(isset($photo[$var]))
			{
				if($rename)
				{
					$photo[$rename] = $photo[$var];
				}
			}
				
			unset($photo[$var]);
		}
		
		if($is_object)
		{
			$photo = (object) $photo;	
		}	
			
		return $photo;
	}
	
	private function load_tmpl()
	{		
		if(!$this->safecracker)
		{			
			require APPPATH . 'libraries/Template.php';	
			$this->EE->TMPL = new EE_Template();
		}
	}
}

// END CLASS

/* End of file ft.keywords.php */
/* Location: ./system/expressionengine/third_party/google_maps/ft.keywords.php */
