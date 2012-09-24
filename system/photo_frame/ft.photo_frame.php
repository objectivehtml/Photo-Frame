<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

/**
 * Photo Frame
 * 
 * @package		Photo Frame
 * @author		Justin Kimbrell
 * @copyright	Copyright (c) 2012, Objective HTML
 * @link 		http://www.objectivehtml.com/photo-frame
 * @version		0.4.0
 * @build		20120923
 */

require 'config/photo_frame_config.php';


class Photo_frame_ft extends EE_Fieldtype {

	public $info = array(
		'name'			=> 'Photo Frame',
		'version'		=> PHOTO_FRAME_VERSION
	);
	
	public $has_array_data 		= TRUE;
	public $safecracker			= FALSE;
		
	private $default_settings	= array(
	);
		
	public function __construct()
	{
		$this->EE =& get_instance();
		
		if(isset($this->EE->safecracker_lib))
		{
			$this->safecracker = TRUE;
		}
		
		/* Fixes bugs imposed by EE 2.5.2 and earlier */
		if(version_compare(APP_VER, '2.5.3', '<'))
		{
			require_once PATH_THIRD . 'photo_frame/config/photo_frame_config.php';
			require_once PATH_THIRD . 'photo_frame/helpers/addon_helper.php';
			require_once PATH_THIRD . 'photo_frame/models/photo_frame_model.php';
			
			$this->EE->photo_frame_model = new Photo_frame_model();		
		}
		else
		{
			$this->EE->load->helper('addon_helper');
			$this->EE->load->model('photo_frame_model');
		}
		
		$this->EE->load->config('photo_frame_config');
			
		if(count($_FILES) > 0 && count($_POST) == 0)
		{
			$this->EE->load->library('photo_frame_lib');
			$this->EE->photo_frame_lib->upload_action();
		}		
	}
	
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
	
	function display_field($data)
	{	
		$this->EE->load->library('photo_frame_lib');
		
		if(!isset($this->EE->theme_loader))
		{
			$this->EE->load->library('theme_loader');
		}
		
		$this->EE->theme_loader->module_name = 'photo_frame';
		$this->EE->theme_loader->css('photo_frame');
		$this->EE->theme_loader->css('jquery.jcrop');
		$this->EE->theme_loader->javascript('photo_frame');
		$this->EE->theme_loader->javascript('jquery.ui.widget');
		$this->EE->theme_loader->javascript('jquery.iframe-transport');
		$this->EE->theme_loader->javascript('jquery.fileupload');
		$this->EE->theme_loader->javascript('jquery.fileupload-fp');
		$this->EE->theme_loader->javascript('jquery.activity-indicator');
		$this->EE->theme_loader->javascript('jquery.load-image');
		$this->EE->theme_loader->javascript('jquery.jcrop');
		$this->EE->theme_loader->javascript('jquery.color');
		
		$entry_id  = empty($data) && $data !== FALSE ? $data : ($this->EE->input->get_post('entry_id') ? $this->EE->input->get_post('entry_id') : (isset($this->EE->safecracker) ? $this->EE->safecracker->entry('entry_id') : 0));
		
		$default_settings = array(
			'photo_frame_display_info' => 'true'
		);
	
		$settings = array_merge($default_settings, $this->settings);
	
		$preview_styles = NULL;
		
		/*
		foreach(array('preview_width', 'preview_height') as $key)
		{
			if(!empty($settings['photo_frame_'.$key]))
			{
				$uom = '';
				
				if(!preg_match('/px|\%/', $settings['photo_frame_'.$key]))
				{
					$uom = 'px';
				}
				
				$preview_styles .= str_replace('preview_', '', $key).': '.$settings['photo_frame_'.$key] . $uom . '; ';
			}	
		}
		*/
		
		$saved_data = array();
		$new_photos = array();
		
		$new_photos_set = isset($_POST[$this->field_name]['new']) ? TRUE : FALSE;
		
		$saved_data = $this->EE->photo_frame_model->get_photos($this->field_id, $entry_id);
		
		if($saved_data->num_rows() > 0 || $new_photos_set)
		{
			if($saved_data->num_rows() > 0)
			{
				$saved_data = $saved_data->result_array();
			}
			else
			{
				$saved_data = array();
			}
			
			if($new_photos_set)
			{
				$new_photos = $_POST[$this->field_name]['new'];
				
				foreach($new_photos as $index => $new_photo)
				{				
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
			
			if(count($saved_data) > 0)
			{
				$directory  = $this->EE->photo_frame_model->get_upload_group($this->settings['photo_frame_upload_group']);
				// $saved_data = $this->EE->photo_frame_model->parse_filenames($saved_data->result_array());
			
				foreach($saved_data as $index => $row)
				{
					$orig_path = $this->EE->photo_frame_model->parse_filename($row['original_file'], 'server_path');
					$file_path = $this->EE->photo_frame_model->parse_filename($row['file'], 'server_path');
					
					$orig_url  = $this->EE->photo_frame_model->parse_filename($row['original_file']);
					$file_url  = $this->EE->photo_frame_model->parse_filename($row['file'], 'url');
					
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
		
		$url      = page_url() . '&dir_id='.$settings['photo_frame_upload_group'].'&field_id='.$this->field_id;
		$crop_url = action_url('photo_frame', 'crop_action', FALSE);
		
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
		
		$settings_js 	= '
		<script type="text/javascript">
			$(document).ready(function() {
				var obj = new PhotoFrame({
					fieldName: \''.$this->field_name.'\',
					fieldId: \''.$this->field_id.'\',
					photos: '.json_encode($saved_data).', 
					wrapper: $("#'.$this->field_name.'_wrapper"),
					url: \''.$url.'\',
					cropUrl: \''.$crop_url.'\',
					settings: '.json_encode($jcrop_settings).',
					directory: '.json_encode($directory).',
					infoPanel: '.$settings['photo_frame_display_info'].'
				});
			});
		</script>';
				
		$this->EE->cp->add_to_head($settings_js);		
				
		$vars = array(
			'id'             => $this->field_id,
			'field_label'    => $settings['field_label'],
			'field_name'     => $this->field_name,
			'data'   	     => $saved_data,
			'new_photos'     => $new_photos,
			'preview_styles' => trim($preview_styles)
		);
		
		return $this->EE->load->view('fieldtype', $vars, TRUE);
	}
	
	public function replace_original($data, $params = array(), $tagdata)
	{
		$params['source']         = 'original';
		
		return $this->replace_tag($data, $params, $tagdata);
	}
	
	public function replace_thumbs($data, $params = array(), $tagdata)
	{
		$params['directory_name'] = '_thumbs';
		$params['source']         = 'original';

		return $this->replace_tag($data, $params, $tagdata);
	}
	
	public function replace_tag($data, $params = array(), $tagdata)
	{
		if(!$params)
		{
			$params = array();	
		}
		
		$default_params = array(
			'id'              => '',
			'class'           => '',
			'alt'             => '',
			'width'           => '',
			'height'          => '',
			'dir'             => '',
			'lang'            => '',
			'title'           => '',
			'source'          => NULL, // [NULL|original]
			'parse_filenames' => 'true', // [framed|original]
			'limit' 		  => NULL,
			'offset' 		  => NULL,
			'directory_name'  => config_item('photo_frame_directory_name'),
			'size' 			  => NULL
		);
		
		$exclude_params = array(
			'source',
			'parse_filenames',
			'limit',
			'offset',
			'directory_name',
			'size'
		);
				
		$params = array_merge($default_params, $params);
		
		$photos = $this->EE->photo_frame_model->get_photos($this->field_id, $data);
		
		if(!is_null($params['size']))
		{
			$params['directory_name'] = '_'.ltrim($params['size']);
			$params['source']         = 'original';
		}
		
		if(is_null($params['limit']))
		{
			$params['limit'] = $photos->num_rows();
		}
		
		if(is_null($params['offset']))
		{
			$params['offset'] = 0;
		}
		
		$params['limit']  = (int) $params['limit'];
		$params['offset'] = (int) $params['offset'];
		
		if($tagdata)
		{
			$return = array();
		}
		else
		{
			$return = NULL;
		}
		
		foreach($photos->result_array() as $index => $row)
		{
			if($index < $params['limit'] && $index >= $params['offset'])
			{
				if(is_array($return))
				{
					$return[] = $row;
				}
				else
				{
					$field = $params['source'] == 'framed' ? 'file' : 'original_file';
					
					$img_params = NULL;
					
					if(empty($params['alt']))
					{
						$params['alt'] = $row['file_name'];
					}
					
					foreach($params as $param => $value)
					{
						if(!in_array($param, $exclude_params))
						{
							if(!empty($value))
							{
								$img_params .= $param.'="'.$value.'" ';
							}
						}	
					}
					
					$return  .= '<img src="'.$row[$field].'" '.trim($img_params).' />';
				}
			}
	
		}
		
		if(is_array($return))
		{
			if(count($return) == 0)
			{
				$return = array(
					array(
						'id'            => '',
						'site_id'       => '',
						'field_id'      => '',
						'entry_id'      => '',
						'height'        => '',
						'width'         => '',
						'x'             => '',
						'x2'            => '',
						'y'             => '',
						'y2'            => '',
						'file'          => '',
						'original_file' => '',
						'file_name'     => '',
						'title'         => '',
						'description'   => '',
						'keywords'      => ''
					)
				);	
			}
			
			$return = $this->parse($return, $tagdata);
		}
		
		if($this->bool_param($params['parse_filenames']))
		{
			/*
			$parse_filenames = TRUE;
				
			if( $params['directory_name'] == config_item('photo_frame_directory_name') &&
			  	$params['source'] == 'original'
			  )
			{
				$parse_filenames = FALSE;
			}
			
			$return = $this->EE->photo_frame_model->parse_filename($return, 'url', $parse_filenames, $params['directory_name']);			
			$return = $this->EE->photo_frame_model->parse_filename($return, 'url');
			*/
			
			$return = $this->EE->photo_frame_model->parse_filename($return, 'url');		
		}
		
		return $return;
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
	
	public function save($data)
	{
		return NULL;
	}
	
	public function post_save($data)
	{
		$this->EE->load->library('photo_frame_lib');
		
		// Create new photos
		
		$new_photos = $this->EE->input->post($this->field_name, TRUE);
		$new_photos = isset($new_photos['new']) ? $new_photos['new'] : array();
			
		if(count($new_photos) > 0)
		{			
			$new_photos = $this->EE->photo_frame_lib->decode_array($new_photos);
			
			foreach($new_photos as $index => $photo)
			{
				$new_photos[$index]['site_id']  = config_item('site_id');
				$new_photos[$index]['field_id'] = $this->field_id;
				$new_photos[$index]['entry_id'] = $this->settings['entry_id'];
				
				$unset = array(
					'directory' => FALSE,
				);
				
				foreach($unset as $var => $rename)
				{
					if(isset($new_photos[$index][$var]))
					{
						if($rename)
						{
							$new_photos[$index][$rename] = $new_photos[$index][$var];
						}
						
						unset($new_photos[$index][$var]);
					}
				}
			}
			
			$this->EE->photo_frame_model->save($new_photos);
		}
		
		// Update existing photos
					
		$update_photos = $this->EE->input->post($this->field_name, TRUE);
		$update_photos = isset($update_photos['edit']) ? $update_photos['edit'] : array();
		
		if($update_photos)
		{
			$this->EE->photo_frame_model->update($update_photos);
		}
	
		// Delete photos
		
		$delete_photos = $this->EE->input->post('photo_frame_delete_photos', TRUE);
		
		if(isset($delete_photos[$this->field_id]))
		{
			$delete_photos = $delete_photos[$this->field_id];
			$this->EE->photo_frame_model->delete($delete_photos);
		}
		
		// Update data with the entry_id
			
		$this->EE->photo_frame_model->update_entry($this->settings['entry_id'], array(
			'field_id_'.$this->field_id => $this->settings['entry_id']
		));
		
		return $this->settings['entry_id'];
	}	

	public function validate($data)
	{
		return TRUE;
	}
	
	public function display_settings($data)
	{
		require PATH_THIRD . 'photo_frame/libraries/Interface_builder/Interface_builder.php';
		
		$IB = new Interface_builder();
		
		$settings = array();
		
		$fields = array(
			'photo_frame_upload_group' => array(
				'label'       => 'File Upload Group',
				'description' => 'Select the file upload group you in which you want to store your photos.',
				'type'        => 'select',
				'settings' => array(
					'options' => $this->EE->photo_frame_model->upload_options()
				)
			),
			'photo_frame_display_info' => array(
				'label'       => 'Display Info Panel',
				'description' => 'Select the file upload group you in which you want to store your photos.',
				'type'        => 'select',
				'settings' => array(
					'options' => array(
						'true'  => 'True',
						'false' => 'False'
					)
				)
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
			'photo_frame_max_height' => array(
				'label' => 'Photo Max Height',
				'description' => 'Values should be numerical and in pixels.'
			),
			'photo_frame_max_width' => array(
				'label' => 'Photo Max Width',
				'description' => 'Values should be numerical and in pixels.'
			),
			'photo_frame_aspect_ratio' => array(
				'label'       => 'Photo Aspect Ratio',
				'description' => 'Enter any desired aspected ration like: 1:1, 1:2, or 4:3. Aspect ratios are <i>width:height</i>'
			),
			'photo_frame_default_location' => array(
				'label' 	  => 'Default Crop Location',
				'description' => 'There should be four coordinates, each represented in pixels which place each corner of the crop utility. If left blank, the crop utility will not display by default. <i>Format: x1, y1, x2, y2</i>'
			)
		);
		
		$vars = array(
			'table' => $IB->table($fields, $data, array(
				'class'       => 'mainTable padTable',
				'border'      => 0,
				'cellpadding' => 0,
				'cellspacing' => 0
			))
		);
		
		return $this->EE->load->view('settings', $vars, TRUE);
	}
	
	public function delete($ids)
	{
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
		
	private function parse($vars, $tagdata = FALSE)
	{
		if($tagdata === FALSE)
		{
			$tagdata = $this->EE->TMPL->tagdata;
		}
			
		return $this->EE->TMPL->parse_variables($tagdata, $vars);
	}   
}

// END CLASS

/* End of file ft.keywords.php */
/* Location: ./system/expressionengine/third_party/google_maps/ft.keywords.php */