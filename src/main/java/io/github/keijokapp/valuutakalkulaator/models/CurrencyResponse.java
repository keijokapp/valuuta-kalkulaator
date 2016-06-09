package io.github.keijokapp.valuutakalkulaator.models;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import io.github.keijokapp.valuutakalkulaator.deserializers.JsonDateDeserializer;
import io.github.keijokapp.valuutakalkulaator.serializers.JsonDateSerializer;

import java.time.LocalDate;
import java.util.Map;


public class CurrencyResponse {

	@JsonDeserialize(using = JsonDateDeserializer.class)
	@JsonSerialize(using = JsonDateSerializer.class)
	private LocalDate date;
	private String from;
	private String to;
	private long input;
	private Map<String, Long> result;

	public LocalDate getDate() {
		return date;
	}

	public void setDate(LocalDate date) {
		this.date = date;
	}

	public String getFrom() {
		return from;
	}

	public void setFrom(String from) {
		this.from = from;
	}

	public String getTo() {
		return to;
	}

	public void setTo(String to) {
		this.to = to;
	}

	public long getInput() {
		return input;
	}

	public void setInput(long input) {
		this.input = input;
	}

	public Map<String, Long> getResult() {
		return result;
	}

	public void setResult(Map<String, Long> result) {
		this.result = result;
	}
}
