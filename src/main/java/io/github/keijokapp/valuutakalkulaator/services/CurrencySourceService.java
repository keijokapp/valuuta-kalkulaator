package io.github.keijokapp.valuutakalkulaator.services;

import io.github.keijokapp.valuutakalkulaator.exceptions.InvalidCurrencyListException;
import io.github.keijokapp.valuutakalkulaator.models.CurrencyList;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.w3c.dom.Document;
import org.xml.sax.SAXException;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.parsers.ParserConfigurationException;
import java.io.IOException;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.time.LocalDate;

@Service
abstract public class CurrencySourceService {

	private static Logger logger = LoggerFactory.getLogger(CurrencySourceService.class);

	protected Document performRequest(String url) throws IOException, ParserConfigurationException, SAXException {
		HttpURLConnection connection = (HttpURLConnection) new URL(url).openConnection();
		connection.setRequestMethod("GET");
		connection.connect();

		InputStream responseStream = connection.getInputStream();

		DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
		DocumentBuilder builder = factory.newDocumentBuilder();
		Document response = builder.parse(responseStream);

		logger.debug("Response: {}", response);
		return response;
	}

	abstract public CurrencyList fetchCurrencyList(LocalDate date) throws InvalidCurrencyListException;

	abstract public String getSourceName();
}
