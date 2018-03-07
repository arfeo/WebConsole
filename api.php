<?

if (isset($_GET["q"]) && !empty($_GET["q"])) {

	switch ($_GET["q"]) {

	case "ip" :
		{
			$response = (!empty($_SERVER["HTTP_CLIENT_IP"])) ? $_SERVER["HTTP_CLIENT_IP"] :
							((!empty($_SERVER["HTTP_X_FORWARDED_FOR"])) ? $_SERVER["HTTP_X_FORWARDED_FOR"] :
								$_SERVER["REMOTE_ADDR"]);
			break;
		}

	case "date" :
		{
			$response = date("D M d H:i:s Y");
			break;
		}

	case "whoami" :
		{
			$response = "guest";
			break;
		}

	default :
		{
			$b = explode(" ", $_GET["q"]);
			$response = $b[0] . ": command not found.";
			break;
		}

	}

} else {

	$response = "Empty request.";

}

exit($response);