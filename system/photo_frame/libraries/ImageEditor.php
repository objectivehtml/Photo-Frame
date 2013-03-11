<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

require_once PATH_THIRD . 'photo_frame/libraries/BaseClass.php';

class ImageEditor extends BaseClass {
 
	protected $image = FALSE;
	
	protected $meta;
	
	protected $type;
	
	protected $filename;
	
	protected $compression = 100; // JPEG only
	
	protected $bgd_color = 0;
	
	/* -----------------------------------------
		Static Functions
	----------------------------------------- */
	
	/**
	 * Return ImageEditor object
	 *
	 * @access	public
	 * @param	string 	Valid image filepath
	 * @return	object
	 */
	public static function init($file)
	{
		return new ImageEditor($file);
	}
	
	/**
	 * Return Image Height
	 *
	 * @access	public
	 * @param	string 	Valid image filepath
	 * @return	object
	 */
	public static function height($file)
	{
		return ImageEditor::init($file)->getHeight();
	}
	
	/**
	 * Return Image Object
	 *
	 * @access	public
	 * @param	string 	Valid image filepath
	 * @return	object
	 */			
	public static function image($file)
	{
		return ImageEditor::init($file)->getImage();
	}
	
	/**
	 * Return Image Type
	 *
	 * @access	public
	 * @param	string 	Valid image filepath
	 * @return	object
	 */
	public static function type($file)
	{
		return ImageEditor::init($file)->getType();
	}
	
	/**
	 * Return Image Width
	 *
	 * @access	public
	 * @param	string 	Valid image filepath
	 * @return	object
	 */
	public static function width($file)
	{
		return ImageEditor::init($file)->getWidth();
	}
		
	/*---------------------------------------------------------------------------*/
	
	/**
	 * Construct
	 *
	 * @access	public
	 * @param	string 	Valid image filepath
	 * @param 	array	An associative array of properties to set
	 * @return	
	 */
	
	public function __construct($filename, $params = array())
	{		
		parent::__construct($params);
		
		$this->filename = $filename;
		
		if(!file_exists($filename))
		{
			return FALSE;
		}
		
		$meta = getimagesize($filename);
		
		$this->meta = $meta;
		$this->type = $meta[2];
		
		switch($this->type) {
			case IMAGETYPE_JPEG:
				$this->image = imagecreatefromjpeg($filename);
				break;
			case IMAGETYPE_GIF:
				$this->image = imagecreatefromgif($filename);
				break;
			case IMAGETYPE_PNG:
				$this->image = imagecreatefrompng($filename);
				break;
		}
		
		if(!$this->image)
		{
			return FALSE;
		}
	}
	
	
	/**
	 * Save an image object to a file
	 *
	 * @access	public
	 * @param	mixed 	Valid image filepath. If FALSE, filename property is used.
	 * @param	mixed 	File permissions. If NULL, permissions will be writable
	 * @return	object
	 */
	public function save($filename = FALSE, $permissions = DIR_WRITE_MODE)
	{
		//header('Content-Type: image/'.$this->type);
		
		if(!$filename)
		{
			$filename = $this->filename;
		}
		
		switch($this->type) {
			case IMAGETYPE_JPEG:
				imagejpeg($this->image, $filename, $this->compression);
				break;
			case IMAGETYPE_GIF:
				imagegif($this->image, $filename);
				break;
			case IMAGETYPE_PNG:
			    // need this for transparent png to work          
			    imagealphablending($this->image, false);
			    imagesavealpha($this->image,true);
			    imagepng($this->image,$filename);
			    break;
		}
		  
		if( $permissions != null)
		{
			chmod($this->filename, $permissions);
		}
	}
	
	
	/**
	 * Get the image object
	 *
	 * @access	public
	 * @return	object
	 */
	public function getImage()
	{
		return $this->image;
	}
	
	
	/**
	 * Get the image tyoe
	 *
	 * @access	public
	 * @return	object
	 */
	public function getType($return_int = FALSE)
	{
		if($return_int)
		{
			return $this->type;	
		}
		
		switch($this->type) {
			case IMAGETYPE_JPEG:
				return 'jpeg';
			case IMAGETYPE_GIF:
				return 'gif';
			case IMAGETYPE_PNG:
				return 'png';
		}
	}
	
	
	/**
	 * Get the image width
	 *
	 * @access	public
	 * @return	object
	 */
	public function getWidth()
	{
      return imagesx($this->image);
	}
	
	
	/**
	 * Get the image height
	 *
	 * @access	public
	 * @return	object
	 */
	public function getHeight()
	{
      return imagesy($this->image);
	}
	
	
	/**
	 * Get the image size
	 *
	 * @access	public
	 * @return	object
	 */
	public function getSize()
	{
      return filesize($this->filename);
	}
	
	
	/**
	 * Resize the image to specified height
	 *
	 * @access	public
	 * @param   int		The height of the image
	 * @return	object
	 */
	public function resizeToHeight($height)
	{	
		$ratio = $height / $this->getHeight();
		$width = $this->getWidth() * $ratio;
		
		$this->resize($width,$height);
	}
	
	
	/**
	 * Resize the image to specified width
	 *
	 * @access	public
	 * @param   int		The width of the image
	 * @return	object
	 */
	public function resizeToWidth($width)
	{
		$ratio  = $width / $this->getWidth();
		$height = $this->getHeight() * $ratio;
		
		$this->resize($width,$height);
	}
	
	
	/**
	 * Resize the image to specified scale
	 *
	 * @access	public
	 * @param   int		The scale of the image
	 * @return	object
	 */
	public function scale($scale)
	{
		$width  = $this->getWidth()  * $scale / 100;
		$height = $this->getHeight() * $scale / 100;
		$this->resize($width,$height);
	}
	
	
	/**
	 * Rotate an image to a specified angle
	 *
	 * @access	public
	 * @param   int		The rotation degree
	 * @param   int		Ignore the image transparency 
	 * @return	object
	 */
	public function rotate($angle = 0, $ignore_transparent = 0)
	{
		imagerotate($this->image, $angle , $this->bgd_color, $ignore_transparent);
	}
	
	
	/**
	 * Rename an image
	 *
	 * @access	public
	 * @param   string	A valid filepath with a filename included
	 * @return	object
	 */
	public function rename($filename)
	{
		if(file_exists($this->filename))
		{
			rename($this->filename, $filename);	
		}
	}
	
	
	/**
	 * Duplcate an image
	 *
	 * @access	public
	 * @param   string	A valid filepath with a filename included
	 * @param   int 	A new image width
	 * @param   int 	A new image height
	 * @param   int 	Resize an image to specified X coordinate
	 * @param   int 	Resize an image to specified Y coordinate
	 * @param   int 	Resize an image to specified X2 coordinate
	 * @param   int 	Resize an image to specified Y2 coordinate
	 * @return	object
	 */
	public function duplicate($filename, $width = FALSE, $height = FALSE, $x = 0, $y = 0, $x2 = 0, $y2 = 0)
	{	
		if(!file_exists($this->filename))
		{
			return;	
		}
		
		copy($this->filename, $filename);	
			
		$image = ImageEditor::init($filename);	
		
		if(!$width && $height)
		{
			$image->resizeToHeight($height);
		}
		else if($width && !$height)
		{
			$image->resizeToWidth($width);	
		}
		else if($width && $height)
		{
			$image->resize($width, $height, $x = 0, $y = 0, $x2 = 0, $y2 = 0);			
		}			
	}
	
	
	/**
	 * Resize an image
	 *
	 * @access	public
	 * @param   int 	A new image width
	 * @param   int 	A new image height
	 * @param   int 	Resize an image to specified X coordinate
	 * @param   int 	Resize an image to specified Y coordinate
	 * @param   int 	Resize an image to specified X2 coordinate
	 * @param   int 	Resize an image to specified Y2 coordinate
	 * @return	object
	 */
	public function resize($width, $height, $x = 0, $y = 0, $x2 = 0, $y2 = 0)
	{
		$resized_image = imagecreatetruecolor($width, $height);
		
		/* Check if this image is PNG or GIF, then set if Transparent*/  
		
		$resized_image = $this->preserve_transparency($resized_image, $width, $height);
		
		imagecopyresampled($resized_image, $this->image, $x2, $y2, $x, $y, $width, $height, $this->getWidth(), $this->getHeight());
		
		$this->image = $resized_image;
		
		$this->save();
	}
	
	
	/**
	 * Preserve image Transparancy
	 *
	 * @access	public
	 * @param   string	A image object
	 * @param   int 	A new image width
	 * @param   int 	A new image height
	 * @return	object
	 */
	public function preserve_transparency($image = FALSE, $width = FALSE, $height = FALSE)
	{
		$return = TRUE;
		
		if(!$image)
		{	
			$return = FALSE;
			$image = $this->image;	
		}
		
		if(!$height)
		{
			$height = $this->getHeight();	
		}
		
		if(!$width)
		{
			$width = $this->getWidth();	
		}
		
		if(($this->type == IMAGETYPE_GIF) || ($this->type==IMAGETYPE_PNG)){
			imagealphablending($image, false);
			imagesavealpha($image,true);
			$transparent = imagecolorallocatealpha($image, 255, 255, 255, 127);
			imagefilledrectangle($image, 0, 0, $width, $height, $transparent);
		}
		
		if($return)
		{
			return $image;
		}
		else
		{
			$this->image = $image;
		}
	}
	
	
	/**
	 * Crop Image
	 *
	 * @access	public
	 * @param   int 	A new image width
	 * @param   int 	A new image height
	 * @param   int 	Resize an image to specified X coordinate
	 * @param   int 	Resize an image to specified Y coordinate
	 * @param   int 	Resize an image to specified X2 coordinate
	 * @param   int 	Resize an image to specified Y2 coordinate
	 * @return	object
	 */
	public function crop($width, $height, $x = 0, $y = 0, $x2 = 0, $y2 = 0)
	{
		$resized_image = imagecreatetruecolor($width, $height);
		
		/* Check if this image is PNG or GIF, then set if Transparent*/  
		
		$this->preserve_transparency($resized_image, $width, $height);
		
		imagecopyresampled($resized_image, $this->image, $x2, $y2, $x, $y, $width, $height, $width, $height);
		
		$this->image = $resized_image;
		
		$this->save();
	}
}