const Testimonial = require("../model/Testimonial");

const getTestimonials = async (req, res) => {
  try {
    const testimonials = await Testimonial.find();
    res.status(200).json(testimonials);
  } catch (err) {
    res.status(500).json({ message: "Error fetching testimonials" });
  }
};

const postTestimonial = async (req, res) => {
  try {
    const newTestimonial = new Testimonial(req.body);
    await newTestimonial.save();
    res.status(201).json(newTestimonial);
  } catch (err) {
    res.status(500).json({ message: "Error saving testimonial" });
  }
};

module.exports = { getTestimonials, postTestimonial };
