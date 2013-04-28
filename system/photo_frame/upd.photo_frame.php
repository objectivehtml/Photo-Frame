<?php  if ( ! defined('BASEPATH')) exit('No direct script access allowed');

/**
 * Photo Frame
 * 
 * @package		Photo Frame
 * @author		Justin Kimbrell
 * @copyright	Copyright (c) 2012, Justin Kimbrell
 * @link 		http://www.objectivehtml.com/photo-frame
 * @version		0.7.0
 * @build		20121031
 */
 
require_once PATH_THIRD . 'photo_frame/config/photo_frame_config.php';

class Photo_frame_upd {

    public $version = PHOTO_FRAME_VERSION;
	public $mod_name;
	public $ext_name;
	public $mcp_name;
	
	private $tables  = array(
		'photo_frame' => array(
			'id' => array(
				'type' 				=> 'int',
				'constraint' 		=> 50,
				'primary_key' 		=> TRUE,
	            'auto_increment' 	=> TRUE
			),
			'date' 	=> array(
				'type'				=> 'timestamp',
			),
			'site_id' 	=> array(
				'type'				=> 'int',
				'constraint'		=> 50
			),
			'field_id' 	=> array(
				'type'				=> 'int',
				'constraint'		=> 50
			),
			'entry_id'	=> array(
				'type'				=> 'int',
				'constraint'		=> 50
			),
			'row_id'	=> array(
				'type'				=> 'int',
				'constraint'		=> 50
			),
			'col_id'	=> array(
				'type'				=> 'int',
				'constraint'		=> 50
			),
			'order'	=> array(
				'type'				=> 'int',
				'constraint'		=> 50
			),
			'height' 	=> array(
				'type'				=> 'float'
			),
			'width' 	=> array(
				'type'				=> 'float'
			),
			'x'		=> array(
				'type'				=> 'int',
				'constraint'		=> 10
			),
			'x2'	=> array(
				'type'				=> 'int',
				'constraint'		=> 10
			),
			'y'		=> array(
				'type'				=> 'int',
				'constraint'		=> 10
			),
			'y2' 	=> array(
				'type'				=> 'int',
				'constraint'		=> 10
			),
			'file' 			=> array(
				'type'				=> 'text'
			),
			'original_file' => array(
				'type'				=> 'text'
			),
			'original_file_name' => array(
				'type'				=> 'text'
			),
			'file_name'		=> array(
				'type' 				=> 'text'
			),
			'title'			=> array(
				'type' 				=> 'text'
			),
			'description'	=> array(
				'type' 				=> 'text'
			),
			'keywords'		=> array(
				'type' 				=> 'text'
			),
			'sizes'			=> array(
				'type' 				=> 'text'
			)
		),
		'photo_frame_colors' => array(
			'id' => array(
				'type' 				=> 'int',
				'constraint' 		=> 50,
				'primary_key' 		=> TRUE,
	            'auto_increment' 	=> TRUE
			),
			'photo_id' 	=> array(
				'type'				=> 'int',
				'constraint'		=> 50
			),
			'site_id' 	=> array(
				'type'				=> 'int',
				'constraint'		=> 50
			),
			'field_id' 	=> array(
				'type'				=> 'int',
				'constraint'		=> 50
			),
			'entry_id'	=> array(
				'type'				=> 'int',
				'constraint'		=> 50
			),
			'row_id'	=> array(
				'type'				=> 'int',
				'constraint'		=> 50
			),
			'col_id'	=> array(
				'type'				=> 'int',
				'constraint'		=> 50
			),
			'date' 	=> array(
				'type'				=> 'timestamp',
			),
			'depth'	=> array(
				'type'				=> 'int',
				'constraint'		=> 50
			),
			'r' 	=> array(
				'type'				=> 'int',
				'constraint'		=> 50
			),
			'g' 	=> array(
				'type'				=> 'int',
				'constraint'		=> 50
			),
			'b' 	=> array(
				'type'				=> 'int',
				'constraint'		=> 50
			),
			'average' => array(
				'type'				=> 'int',
				'constraint'		=> 1,
				'default'		    => 0
			),
		)
	);
	
	private $actions = array(
		array(
			'class'  => 'Photo_frame_mcp',
			'method' => 'crop_photo'
		),
		array(
			'class'  => 'Photo_frame_mcp',
			'method' => 'photo_response'
		),
		array(
			'class'  => 'Photo_frame_mcp',
			'method' => 'preview_crop_photo'
		),
		array(
			'class'  => 'Photo_frame_mcp',
			'method' => 'upload_photo'
		)
	);
		
	private $hooks = array(
	);
	
    public function __construct()
    {
        // Make a local reference to the ExpressionEngine super object
        $this->EE =& get_instance();
        
        $this->mod_name 	= str_replace('_upd', '', __CLASS__);
        $this->ext_name		= $this->mod_name . '_ext';
        $this->mcp_name		= $this->mod_name . '_mcp';
    }
	
	public function install()
	{	
		$this->EE->load->library('data_forge');
		
		$this->EE->data_forge->update_tables($this->tables);
				
		$data = array(
	        'module_name' 		 => $this->mod_name,
	        'module_version' 	 => $this->version,
	        'has_cp_backend' 	 => 'n',
	        'has_publish_fields' => 'n'
	    );
	    	
	    $this->EE->db->insert('modules', $data);
	    	    	    
		foreach ($this->hooks as $row)
		{
			$this->EE->db->insert(
				'extensions',
				array(
					'class' 	=> $this->ext_name,
					'method' 	=> $row[0],
					'hook' 		=> ( ! isset($row[1])) ? $row[0] : $row[1],
					'settings' 	=> ( ! isset($row[2])) ? '' : $row[2],
					'priority' 	=> ( ! isset($row[3])) ? 10 : $row[3],
					'version' 	=> $this->version,
					'enabled' 	=> 'y',
				)
			);
		}
		
		foreach($this->actions as $action)
			$this->EE->db->insert('actions', $action);
		
		$this->_set_defaults();
				
		return TRUE;
	}
	
	
	public function update($current = '')
	{
		require_once 'libraries/Data_forge.php';
	
		$this->EE->data_forge = new Data_forge();
		$this->EE->data_forge->update_tables($this->tables);
		
		foreach($this->actions as $action)
		{
			$this->EE->db->where(array(
				'class'  => $action['class'],
				'method' => $action['method']
			));
			
			$existing = $this->EE->db->get('actions');

			if($existing->num_rows() == 0)
			{
				$this->EE->db->insert('actions', $action);
			}
		}
		
		foreach($this->hooks as $row)
		{
			$this->EE->db->where(array(
				'class'  => $this->ext_name,
				'method'  => $row[0],
				'hook' => $row[1]
			));
			
			$existing = $this->EE->db->get('extensions');

			if($existing->num_rows() == 0)
			{
				$this->EE->db->insert(
					'extensions',
					array(
						'class' 	=> $this->ext_name,
						'method' 	=> $row[0],
						'hook' 		=> ( ! isset($row[1])) ? $row[0] : $row[1],
						'settings' 	=> ( ! isset($row[2])) ? '' : $row[2],
						'priority' 	=> ( ! isset($row[3])) ? 10 : $row[3],
						'version' 	=> $this->version,
						'enabled' 	=> 'y',
					)
				);
			}
		}
		
	    return TRUE;
	}
	
	public function uninstall()
	{
		$this->EE->load->dbforge();
		
		$this->EE->db->delete('modules', array('module_name' => $this->mod_name));
		$this->EE->db->delete('extensions', array('class' => $this->ext_name));		
		$this->EE->db->delete('actions', array('class' => $this->mod_name));
		
		$this->EE->db->delete('actions', array('class' => $this->mod_name));
		$this->EE->db->delete('actions', array('class' => $this->mcp_name));
		
		foreach(array_keys($this->tables) as $table)
		{
			$this->EE->dbforge->drop_table($table);
		}
			
		return TRUE;
	}
	
	private function _set_defaults()
	{ 

	}
}
