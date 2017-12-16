package edu.asupoly.ser421;

import java.io.*;
import java.net.*;
import java.util.HashMap;
import java.util.StringTokenizer;

public class Lab1Part2 {

	public static void main(String args[]) {
		if (args.length != 5) {
			System.out.println("Parameters not sufficient");
			System.exit(1);
		}

		int localPort = Integer.parseInt(args[0]);
		String hostName = args[1];
		int serverPort = Integer.parseInt(args[2]);
		int cacheSize = 1024 * Integer.parseInt(args[3]); // 1 KB = 1024 B
		int delay = Integer.parseInt(args[4]);
		
		Cache_LRU lru = new Cache_LRU(cacheSize);

		Lab1Part2 server = new Lab1Part2(localPort, lru, hostName, serverPort, delay);
	}

	public Lab1Part2(int port, Cache_LRU lru, String hostName, int serverPort, int delay) {

		ServerSocket server = null;
		Socket sock = null;

		try {

			server = new ServerSocket(port);

		} catch (IOException ex) {

			ex.printStackTrace();

		}

		while (server.isBound() && !server.isClosed()) {
			System.out.println("Ready....");
			try {
				
				sock = server.accept();
				createClientThread(sock, lru, hostName, serverPort, delay);

			} catch (IOException ex) {

				ex.printStackTrace();
			}
		}
	}

	/**
	 * Making a thread for new socket by passing it to inner class ClientHandler
	 * implements Runnable; subsequently start the thread up so it can be
	 * processed.
	 */
	private void createClientThread(Socket sock, Cache_LRU lru, String hostName, int serverPort, int delay) {
		Thread thread = new Thread(new ClientHandler(sock, hostName, serverPort, delay, lru));
		thread.start();
	}
}

/**
 * ClientHandler handles new client requests i.e., threads. Accepts the client
 * socket as a constructor parameter, gets the IO streams and then calls the
 * overridden run() method to complete the transaction.
 */
class ClientHandler implements Runnable {

	// Establishing new socket to read client input
	InputStream in = null;
	OutputStream out = null;
	String hostName;
	int serverPort;
	int delay;
	Cache_LRU lru;

	public ClientHandler(Socket clientSocket, String hostName, int serverPort, int delay, Cache_LRU lru) {
		try {
			// Set local socket to clientSocket received via constructor
			in = clientSocket.getInputStream();
			out = clientSocket.getOutputStream();
			this.hostName = hostName;
			this.serverPort = serverPort;
			this.delay = delay;
			this.lru = lru;

		} catch (Exception ex) {
			ex.printStackTrace();
		}
	}// end constructor

	public byte[] createResponse(InputStream inStream) {

		byte[] response = null;
		BufferedReader in = null;

		try {

			in = new BufferedReader(new InputStreamReader(inStream, "UTF-8"));

			String filename = null;
			String line = in.readLine();

			System.out.println("Received File Name: " + line);

			if (line != null && !line.trim().equals("")) {
				
				StringTokenizer st = new StringTokenizer(line);
				
				if (st.nextToken().equals("GET") && st.hasMoreTokens()) {
					
					filename = st.nextToken();
				}
			}

			// Generate an appropriate response to the user
			if (filename == null) {
				
				response = "<html>Illegal request: no GET</html>".getBytes();
				
			} else {
				URL conn = null;
				
				HttpURLConnection httpConn = null;

				if (lru.get(filename.toString()) == null) {

					System.out.println(filename.toString() + " ....." + lru.get(filename.toString()));
					System.out.println("Retrieving file from remote server");

					conn = new URL("http", hostName, serverPort, filename.toString());

					httpConn = (HttpURLConnection) conn.openConnection();

					StringBuilder sb = new StringBuilder();

					BufferedReader bReader = new BufferedReader(new InputStreamReader(httpConn.getInputStream()));

					String data;
					while ((data = bReader.readLine()) != null) {
						sb.append(data);
					}

					lru.set(filename.toString(), sb.toString());

					sb.append("\n");

					response = sb.toString().getBytes();

				} else {

					System.out.println("Retrieving file from cache");

					String file = lru.get(filename).toString();
					response = file.getBytes();
				}
			}
		} catch (IOException e) {
			
			e.printStackTrace();
			response = ("<html>ERROR: " + e.getMessage() + "</html").getBytes();
		}
		System.out.println("RESPONSE GENERATED!");
		return response;
	}


	public static byte[] readFileInBytes(File f) throws IOException {

		byte[] result = new byte[(int) f.length()];

		try {
			
			new FileInputStream(f).read(result);
			
		} catch (Exception ex) {
			
			ex.printStackTrace();
		}

		return result;
	}

	public void run() {
		
		System.out.println("Starting thread");
		
		try {
			
			byte[] b = createResponse(in);

			out.write(b);

			Thread.sleep(delay);

		} catch (InterruptedException e) {
			
			e.printStackTrace();
			
		} catch (IOException ex) {
			
			ex.printStackTrace();
			
		} finally {
			
			try {
				
				in.close();
				
				out.close();
				
			} catch (IOException ex) {
				
				ex.printStackTrace();
			}
		}
		System.out.println("Ending thread");
	}
}

class Cache_LRU {
	int available_space;
	int total_cache_capacity;
	HashMap<String, CacheNode> map = new HashMap<String, CacheNode>();
	CacheNode head = null;
	CacheNode end = null;

	public Cache_LRU(int available_space) {
		
		this.available_space = available_space;
		this.total_cache_capacity = available_space;
	}

	public synchronized String get(String key) {
		
		if (map.containsKey(key)) {
			
			CacheNode n = map.get(key);
			
			remove(n);
			setHead(n);
			
			return n.value;
		}

		return null;
	}

	public synchronized void remove(CacheNode n) {

		available_space += n.value.getBytes().length;

		if (n.pre != null) {
			n.pre.next = n.next;
		} else {
			head = n.next;
		}

		if (n.next != null) {
			n.next.pre = n.pre;
		} else {
			end = n.pre;
		}

	}

	public synchronized void setHead(CacheNode n) {
		n.next = head;
		n.pre = null;

		if (head != null)
			head.pre = n;

		head = n;

		if (end == null)
			end = head;
	}

	public synchronized void set(String key, String value) {
		
		if (value.getBytes().length > total_cache_capacity) {
			
			System.out.println("File size is greater than cache");
			return;
		}
		if (map.containsKey(key)) {
			
			CacheNode old = map.get(key);
			old.value = value;
			remove(old);
			setHead(old);
			
		} else {
			
			CacheNode created = new CacheNode(key, value);
			while (value.getBytes().length > available_space) {
				
				map.remove(end.key);
				remove(end);
			}
			setHead(created);
			map.put(key, created);
			System.out.println(key + "..." + value + "...map");
			available_space -= value.getBytes().length;
		}
	}
}

class CacheNode {
	
	String key;
	String value;
	CacheNode pre;
	CacheNode next;

	public CacheNode(String key, String value) {
		
		this.key = key;
		this.value = value;
	}
}